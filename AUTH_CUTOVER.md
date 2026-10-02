# Supabase Auth production cutover

Trakive selects authentication with an explicit provider switch. Local development keeps the existing password hashes, JWTs, refresh-token families, device limits, and custom email/reset tokens. Production uses Supabase Auth for authentication while Trakive remains authoritative for user IDs, profiles, roles, permissions, account status, organization, department, onboarding, and all business data.

## Environment

Render production:

```env
NODE_ENV=production
AUTH_PROVIDER=supabase
FRONTEND_URL=https://trakive.vercel.app
CORS_ORIGIN=https://trakive.vercel.app
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=PUBLIC_BROWSER_SAFE_KEY
SUPABASE_SERVICE_ROLE_KEY=SERVER_ONLY_SERVICE_ROLE_KEY
AUTH_CHALLENGE_ENCRYPTION_KEY=INDEPENDENT_RANDOM_32_BYTE_OR_LONGER_SECRET
MFA_ENCRYPTION_KEY=EXISTING_TOTP_ENCRYPTION_SECRET
DATABASE_URL=SUPABASE_POSTGRES_CONNECTION_STRING
```

Vercel production:

```env
VITE_AUTH_PROVIDER=supabase
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api/v1
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=PUBLIC_BROWSER_SAFE_KEY
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `AUTH_CHALLENGE_ENCRYPTION_KEY` through a `VITE_` variable.

Local development uses `AUTH_PROVIDER=local` and `VITE_AUTH_PROVIDER=local`. Supabase variables are not required in local mode.

## Supabase Dashboard

1. Enable Email/Password authentication and require email confirmation.
2. Set Site URL to `https://trakive.vercel.app`.
3. Add redirect URLs:
   - `https://trakive.vercel.app/verify-email`
   - `https://trakive.vercel.app/reset-password`
   - local testing only: `http://localhost:5173/verify-email` and `http://localhost:5173/reset-password`
4. Configure the confirmation template to return to `/verify-email`.
5. Configure the recovery template to return to `/reset-password`.
6. Configure the magic-link/email-OTP template to visibly include `{{ .Token }}`. The failed-login escalation verifies the six-digit email OTP, not a browser-only counter.
7. Keep Supabase's email send and OTP throttles enabled. Trakive additionally permits at most three sends per login challenge and enforces a 60-second resend interval.
8. Confirm that no role, permission, organization, department, or Trakive user ID is sourced from Supabase metadata.

## Existing-user activation

An existing user selects **Activate existing account** on the login page, enters the same official work email, and creates a new production password. Supabase sends confirmation to that address. Trakive does not create a duplicate business profile or ask the user to re-enter profile details. After the user confirms the email and authenticates, the backend cryptographically verifies the Supabase access token and atomically links the matching unlinked profile by normalized email. Only then is `users.supabase_auth_id` set. The existing `users.id` and every relationship remain unchanged. If the account was already activated, the user should use password recovery instead.

If a Supabase identity already exists but the password is unknown, use Forgot password. No legacy hash is copied to Supabase and production never falls back to the legacy password.

## Failed-login escalation and TOTP

Failed Supabase password attempts are counted against the existing Trakive profile in a server-controlled rolling 15-minute window. The fifth failure activates escalation. A later correct password is held in an encrypted, ten-minute, single-use login challenge while Supabase sends an email OTP. The OTP is verified through Supabase; Trakive limits attempts and records security events. Successful completion clears the escalation state.

Existing authenticator-app TOTP stays in Trakive because its encrypted secrets cannot be safely imported into Supabase MFA. After password verification, the backend checks `user_settings`. If escalation and TOTP are both required, the same challenge records each factor independently and releases the Supabase session only after both succeed. Local-mode TOTP is unchanged.

## Session/device behavior

Supabase is the sole refresh-token authority in production. The browser SDK restores and refreshes the Supabase session; API calls carry its access token. Trakive does not create local refresh-token rows for Supabase sessions. Supabase does not provide the application with a reliable complete per-device session list, so production hides per-device revocation rather than simulating it. Current-browser logout uses Supabase. Password change attempts to sign out other Supabase sessions. Local mode retains the existing device list, seven-device limit, inactivity expiration, rotation, and revocation controls.

## Exact deployment order

1. Back up the production database and record the current release identifier.
2. Configure the Supabase Dashboard email provider, templates, Site URL, and redirect URLs above.
3. Generate independent high-entropy `AUTH_CHALLENGE_ENCRYPTION_KEY` and confirm the existing `MFA_ENCRYPTION_KEY` is available.
4. Deploy the backend code with `AUTH_PROVIDER=local` first.
5. Run `npm run migrate` in `backend` to apply `022_supabase_auth_cutover.sql`.
6. Configure all Render production variables, but keep `AUTH_PROVIDER=local` until the frontend deployment is ready.
7. Configure the Vercel variables and deploy the frontend with `VITE_AUTH_PROVIDER=supabase` in the coordinated cutover window.
8. Set Render `AUTH_PROVIDER=supabase` and deploy/restart the backend. This immediately makes protected middleware reject all legacy custom JWTs.
9. In the Render production shell, with `AUTH_PROVIDER=supabase`, run `npm run auth:revoke-legacy-sessions`. The command refuses to run in local mode and only marks legacy refresh-token rows revoked.
10. Test registration, confirmation, activation of an existing user, login, recovery, TOTP, escalation, role checks, logout, and a protected API call with a staging/approved production account from each allowed domain.
11. Monitor `audit_logs`, authentication errors, Supabase Auth logs, email delivery, and Render logs. Do not remove legacy columns/tables because local development still uses them.

Rollback means restoring the previous frontend deployment and setting both provider variables back to `local` in the corresponding non-production environment. Do not re-enable local auth in production after users have begun the Supabase cutover without a deliberate incident-response decision.
