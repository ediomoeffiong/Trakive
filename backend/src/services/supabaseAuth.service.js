const crypto = require('crypto');
const { query } = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const LocalAuthService = require('./auth.service');
const UserModel = require('../models/user.model');
const AuditLogModel = require('../models/auditLog.model');
const { getSupabasePublicClient, getSupabaseAdminClient } = require('../config/supabase');
const { assertAllowedEmail, normalizeEmail } = require('../utils/emailDomain');
const { hashToken } = require('../utils/token.utils');
const { verifyCode } = require('../utils/twoFactor.utils');
const { encryptChallengePayload, decryptChallengePayload } = require('../utils/authChallengeCrypto');
const { resolveSupabaseIdentity } = require('./supabaseIdentity.service');

const CHALLENGE_TTL_MINUTES = 10;
const MAX_CHALLENGE_ATTEMPTS = 5;

const audit = (user, action, details, meta = {}) => AuditLogModel.log({
  organizationId: user?.organization_id,
  userId: user?.id,
  action,
  entityType: 'users',
  entityId: user?.id,
  details,
  ipAddress: meta.ipAddress,
  userAgent: meta.userAgent,
});

const recordFailedPassword = async (user, email, meta) => {
  if (!user) return;
  const result = await query(
    `INSERT INTO auth_login_security
       (user_id, failure_count, window_started_at, escalation_active, escalation_triggered_at, last_failed_at, last_failed_ip)
     VALUES ($1, 1, NOW(), false, NULL, NOW(), $2)
     ON CONFLICT (user_id) DO UPDATE SET
       failure_count = CASE
         WHEN auth_login_security.window_started_at > NOW() - INTERVAL '15 minutes'
           THEN auth_login_security.failure_count + 1 ELSE 1 END,
       window_started_at = CASE
         WHEN auth_login_security.window_started_at > NOW() - INTERVAL '15 minutes'
           THEN auth_login_security.window_started_at ELSE NOW() END,
       escalation_active = auth_login_security.escalation_active OR
         (CASE WHEN auth_login_security.window_started_at > NOW() - INTERVAL '15 minutes'
           THEN auth_login_security.failure_count + 1 ELSE 1 END) >= 5,
       escalation_triggered_at = CASE
         WHEN NOT auth_login_security.escalation_active AND
           (CASE WHEN auth_login_security.window_started_at > NOW() - INTERVAL '15 minutes'
             THEN auth_login_security.failure_count + 1 ELSE 1 END) >= 5
           THEN NOW() ELSE auth_login_security.escalation_triggered_at END,
       last_failed_at = NOW(), last_failed_ip = $2, updated_at = NOW()
     RETURNING failure_count, escalation_active`,
    [user.id, meta.ipAddress]
  );
  const state = result.rows[0];
  await audit(user, 'USER_LOGIN_FAILED', { email: normalizeEmail(email), provider: 'supabase' }, meta);
  if (state?.escalation_active && Number(state.failure_count) === 5) {
    await audit(user, 'LOGIN_ESCALATION_TRIGGERED', { windowMinutes: 15, threshold: 5 }, meta);
  }
};

const getEscalationState = async (userId) => {
  await query(
    `UPDATE auth_login_security
     SET escalation_active = false, escalation_triggered_at = NULL,
         failure_count = 0, window_started_at = NULL, updated_at = NOW()
     WHERE user_id = $1 AND escalation_active = true
       AND escalation_triggered_at <= NOW() - INTERVAL '15 minutes'`,
    [userId]
  );
  const result = await query(
    `SELECT escalation_active FROM auth_login_security WHERE user_id = $1`,
    [userId]
  );
  return Boolean(result.rows[0]?.escalation_active);
};

const createChallenge = async (user, session, requirements, meta) => {
  const challengeToken = crypto.randomBytes(32).toString('base64url');
  await query(
    `INSERT INTO supabase_login_challenges
       (user_id, token_hash, encrypted_session, email_otp_required, totp_required,
        expires_at, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${CHALLENGE_TTL_MINUTES} minutes', $6, $7)`,
    [user.id, hashToken(challengeToken), encryptChallengePayload({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
    }), requirements.emailOtpRequired, requirements.totpRequired, meta.ipAddress, meta.userAgent]
  );

  if (requirements.emailOtpRequired) {
    const { error } = await getSupabasePublicClient().auth.signInWithOtp({
      email: user.email,
      options: { shouldCreateUser: false },
    });
    if (error) throw ApiError.tooManyRequests?.('Unable to send email verification code right now') || ApiError.badRequest('Unable to send email verification code right now');
    await query(
      `UPDATE supabase_login_challenges SET last_otp_sent_at = NOW(), resend_count = 1 WHERE token_hash = $1`,
      [hashToken(challengeToken)]
    );
    await audit(user, 'EMAIL_OTP_SENT', { purpose: 'failed-login-escalation' }, meta);
  }

  return { challengeRequired: true, challengeToken, ...requirements };
};

const getChallenge = async (challengeToken) => {
  const result = await query(
    `SELECT c.*, u.email, u.organization_id, u.supabase_auth_id
     FROM supabase_login_challenges c JOIN users u ON u.id = c.user_id
     WHERE c.token_hash = $1 AND c.used_at IS NULL AND c.expires_at > NOW()`,
    [hashToken(challengeToken)]
  );
  const challenge = result.rows[0];
  if (!challenge) throw ApiError.unauthorized('The login challenge is invalid or expired');
  if (challenge.verification_attempts >= MAX_CHALLENGE_ATTEMPTS) throw ApiError.unauthorized('Too many challenge attempts. Sign in again.');
  return challenge;
};

const finalizeChallenge = async (challenge, challengeToken, meta) => {
  const emailDone = !challenge.email_otp_required || challenge.email_otp_verified_at;
  const totpDone = !challenge.totp_required || challenge.totp_verified_at;
  if (!emailDone || !totpDone) {
    return {
      challengeRequired: true,
      challengeToken,
      emailOtpRequired: Boolean(challenge.email_otp_required && !challenge.email_otp_verified_at),
      totpRequired: Boolean(challenge.totp_required && !challenge.totp_verified_at),
    };
  }
  const consumed = await query(
    `UPDATE supabase_login_challenges SET used_at = NOW()
     WHERE id = $1 AND used_at IS NULL RETURNING encrypted_session`,
    [challenge.id]
  );
  if (!consumed.rows[0]) throw ApiError.unauthorized('The login challenge has already been used');
  await query(
    `INSERT INTO auth_login_security (user_id, failure_count, escalation_active, updated_at)
     VALUES ($1, 0, false, NOW())
     ON CONFLICT (user_id) DO UPDATE SET failure_count = 0, window_started_at = NULL,
       escalation_active = false, escalation_triggered_at = NULL, updated_at = NOW()`,
    [challenge.user_id]
  );
  const user = await UserModel.findByIdWithRoleAndPermissions(challenge.user_id);
  await UserModel.updateLastLogin(user.id);
  await audit(user, 'SUPABASE_LOGIN', { emailOtp: Boolean(challenge.email_otp_required), totp: Boolean(challenge.totp_required) }, meta);
  const tokens = decryptChallengePayload(consumed.rows[0].encrypted_session);
  return { user: UserModel.sanitizeUser(user), tokens };
};

const SupabaseAuthService = {
  async activateExisting(rawEmail, password, ipAddress = null, userAgent = null) {
    const email = assertAllowedEmail(rawEmail);
    const existing = await UserModel.findByEmail(email);

    if (!existing) {
      throw ApiError.badRequest('We could not activate this account. Check the work email or contact your Trakive administrator.');
    }
    if (existing.status !== 'active') {
      throw ApiError.forbidden('This Trakive account is inactive or suspended. Contact your administrator.');
    }
    if (existing.supabase_auth_id) {
      throw ApiError.conflict('This account is already activated. Sign in or reset your password.');
    }

    const { data: signUp, error } = await getSupabasePublicClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${config.frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email)}` },
    });
    if (error) throw ApiError.badRequest(error.message);
    if (!signUp?.user) throw ApiError.badRequest('Unable to start account activation right now');

    await audit(existing, 'SUPABASE_ACTIVATION_REQUESTED', { email }, { ipAddress, userAgent });
    return {
      verificationRequired: true,
      email,
    };
  },

  async register(data, ipAddress = null, userAgent = null) {
    const email = assertAllowedEmail(data.email);
    const existing = await UserModel.findByEmail(email);
    if (existing?.supabase_auth_id) throw ApiError.conflict('This Trakive account is already activated. Sign in or reset your password.');
    const { data: signUp, error } = await getSupabasePublicClient().auth.signUp({
      email,
      password: data.password,
      options: { emailRedirectTo: `${config.frontendUrl.replace(/\/$/, '')}/verify-email` },
    });
    if (error) throw ApiError.badRequest(error.message);
    if (!signUp?.user) throw ApiError.badRequest('Unable to create the Supabase authentication identity');

    if (existing) {
      return {
        user: UserModel.sanitizeUser(existing),
        verificationRequired: true,
        migrationActivation: true,
      };
    }

    try {
      return await LocalAuthService.register(
        { ...data, email }, ipAddress, userAgent,
        { provider: 'supabase', supabaseAuthId: signUp.user.id }
      );
    } catch (registrationError) {
      const cleanup = await getSupabaseAdminClient().auth.admin.deleteUser(signUp.user.id).catch((error) => ({ error }));
      if (!cleanup?.error) {
        await query(`DELETE FROM users WHERE supabase_auth_id = $1 AND LOWER(email) = $2`, [signUp.user.id, email]);
      }
      throw registrationError;
    }
  },

  async login(email, password, ipAddress = null, userAgent = null) {
    email = assertAllowedEmail(email);
    const meta = { ipAddress, userAgent };
    const existing = await UserModel.findByEmail(email);
    const { data, error } = await getSupabasePublicClient().auth.signInWithPassword({ email, password });
    if (error || !data?.user || !data?.session) {
      if (existing?.supabase_auth_id && (!error?.code || ['invalid_credentials', 'invalid_grant'].includes(error.code))) {
        await recordFailedPassword(existing, email, meta);
      }
      if (existing && !existing.supabase_auth_id) {
        throw new ApiError(
          409,
          'Your existing Trakive profile needs a one-time account setup before you can sign in.',
          { code: 'ACCOUNT_ACTIVATION_REQUIRED', email },
        );
      }
      throw ApiError.unauthorized('The email or password is incorrect. Please try again or reset your password.');
    }

    const user = await resolveSupabaseIdentity(data.user, meta);
    const settings = await query(
      `SELECT two_factor_enabled, two_factor_secret FROM user_settings WHERE user_id = $1`,
      [user.id]
    );
    const requirements = {
      emailOtpRequired: await getEscalationState(user.id),
      totpRequired: Boolean(settings.rows[0]?.two_factor_enabled && settings.rows[0]?.two_factor_secret),
    };
    if (requirements.emailOtpRequired || requirements.totpRequired) {
      return createChallenge(user, data.session, requirements, meta);
    }

    await query(
      `INSERT INTO auth_login_security (user_id, failure_count, escalation_active, updated_at)
       VALUES ($1, 0, false, NOW())
       ON CONFLICT (user_id) DO UPDATE SET failure_count = 0, window_started_at = NULL, updated_at = NOW()`,
      [user.id]
    );
    const isFirstLogin = !user.last_login_at;
    await UserModel.updateLastLogin(user.id);
    await audit(user, 'SUPABASE_LOGIN', { provider: 'supabase' }, meta);
    return {
      user: { ...UserModel.sanitizeUser(user), isFirstLogin },
      tokens: { accessToken: data.session.access_token, refreshToken: data.session.refresh_token },
    };
  },

  async verifyEmailOtpLogin(challengeToken, code, ipAddress = null, userAgent = null) {
    const challenge = await getChallenge(challengeToken);
    if (!challenge.email_otp_required || challenge.email_otp_verified_at) {
      throw ApiError.badRequest('An email OTP is not required for this challenge');
    }
    const { error } = await getSupabasePublicClient().auth.verifyOtp({ email: challenge.email, token: code, type: 'email' });
    if (error) {
      await query(`UPDATE supabase_login_challenges SET verification_attempts = verification_attempts + 1 WHERE id = $1`, [challenge.id]);
      const user = await UserModel.findByIdWithRoleAndPermissions(challenge.user_id);
      await audit(user, 'EMAIL_OTP_VERIFICATION_FAILED', { purpose: 'failed-login-escalation' }, { ipAddress, userAgent });
      throw ApiError.unauthorized('The email verification code is invalid or expired');
    }
    await query(`UPDATE supabase_login_challenges SET email_otp_verified_at = NOW() WHERE id = $1`, [challenge.id]);
    challenge.email_otp_verified_at = new Date();
    const user = await UserModel.findByIdWithRoleAndPermissions(challenge.user_id);
    await audit(user, 'EMAIL_OTP_VERIFIED', { purpose: 'failed-login-escalation' }, { ipAddress, userAgent });
    return finalizeChallenge(challenge, challengeToken, { ipAddress, userAgent });
  },

  async resendEmailOtpLogin(challengeToken, ipAddress = null, userAgent = null) {
    const challenge = await getChallenge(challengeToken);
    if (!challenge.email_otp_required || challenge.email_otp_verified_at) {
      throw ApiError.badRequest('An email OTP is not required for this challenge');
    }
    if (challenge.resend_count >= 3) throw new ApiError(429, 'Email code resend limit reached. Sign in again later.');
    if (challenge.last_otp_sent_at && new Date(challenge.last_otp_sent_at).getTime() > Date.now() - 60_000) {
      throw new ApiError(429, 'Wait 60 seconds before requesting another email code');
    }
    const { error } = await getSupabasePublicClient().auth.signInWithOtp({
      email: challenge.email,
      options: { shouldCreateUser: false },
    });
    if (error) throw ApiError.badRequest('Unable to send another email code');
    await query(
      `UPDATE supabase_login_challenges SET resend_count = resend_count + 1, last_otp_sent_at = NOW() WHERE id = $1`,
      [challenge.id]
    );
    const user = await UserModel.findByIdWithRoleAndPermissions(challenge.user_id);
    await audit(user, 'EMAIL_OTP_SENT', { purpose: 'failed-login-escalation', resend: true }, { ipAddress, userAgent });
    return { challengeRequired: true, challengeToken, emailOtpRequired: true, totpRequired: Boolean(challenge.totp_required && !challenge.totp_verified_at) };
  },

  async verifyTwoFactorLogin(challengeToken, code, ipAddress = null, userAgent = null) {
    const challenge = await getChallenge(challengeToken);
    if (!challenge.totp_required || challenge.totp_verified_at) throw ApiError.badRequest('Authenticator verification is not required');
    const result = await query(`SELECT two_factor_secret FROM user_settings WHERE user_id = $1 AND two_factor_enabled = true`, [challenge.user_id]);
    if (!result.rows[0]?.two_factor_secret || !(await verifyCode(result.rows[0].two_factor_secret, code))) {
      await query(`UPDATE supabase_login_challenges SET verification_attempts = verification_attempts + 1 WHERE id = $1`, [challenge.id]);
      const user = await UserModel.findByIdWithRoleAndPermissions(challenge.user_id);
      await audit(user, 'TWO_FACTOR_LOGIN_FAILED', { provider: 'supabase' }, { ipAddress, userAgent });
      throw ApiError.unauthorized('The authentication code is invalid or expired');
    }
    await query(`UPDATE supabase_login_challenges SET totp_verified_at = NOW() WHERE id = $1`, [challenge.id]);
    challenge.totp_verified_at = new Date();
    return finalizeChallenge(challenge, challengeToken, { ipAddress, userAgent });
  },

  async refresh() { throw ApiError.badRequest('Supabase refresh tokens are managed by the Supabase client'); },
  async logout(_refreshToken, context = {}) {
    if (context.user) await audit(context.user, 'SUPABASE_LOGOUT', { scope: 'current-session' }, context);
    return { message: 'Logged out successfully' };
  },
  async getMe(userId) { return LocalAuthService.getMe(userId); },

  async changePassword(userId, currentPassword, newPassword, currentAccessToken) {
    const user = await UserModel.findById(userId);
    if (!user?.supabase_auth_id) throw ApiError.forbidden('No Supabase identity is linked to this account');
    const { error } = await getSupabasePublicClient().auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (error) throw ApiError.unauthorized('Current password is incorrect');
    const { error: updateError } = await getSupabaseAdminClient().auth.admin.updateUserById(user.supabase_auth_id, { password: newPassword });
    if (updateError) throw ApiError.badRequest(updateError.message);
    if (currentAccessToken) {
      await getSupabaseAdminClient().auth.admin.signOut(currentAccessToken, 'others').catch(() => {});
    }
    return { message: 'Password changed successfully' };
  },

  async forgotPassword(email) {
    email = assertAllowedEmail(email);
    const user = await UserModel.findByEmail(email);
    const { error } = await getSupabasePublicClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${config.frontendUrl.replace(/\/$/, '')}/reset-password`,
    });
    if (error) throw ApiError.badRequest('Unable to send password recovery email');
    if (user) await audit(user, 'SUPABASE_PASSWORD_RECOVERY_REQUESTED', {}, {});
    return { message: 'If an eligible account exists, password recovery instructions have been sent.' };
  },
  async resetPassword() { throw ApiError.badRequest('Open the Supabase recovery link to reset your password'); },
  async verifyEmail() { return { message: 'Email verification is handled by the Supabase verification link' }; },
};

module.exports = SupabaseAuthService;
