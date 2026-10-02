-- Supabase Auth identity linkage and conditional-login challenge state.
-- Existing Trakive user IDs and legacy local-auth data remain unchanged.
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_auth_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_auth_id
  ON users (supabase_auth_id) WHERE supabase_auth_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS auth_login_security (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  window_started_at TIMESTAMPTZ,
  escalation_active BOOLEAN NOT NULL DEFAULT false,
  escalation_triggered_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_failed_ip VARCHAR(45),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supabase_login_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  encrypted_session TEXT NOT NULL,
  email_otp_required BOOLEAN NOT NULL DEFAULT false,
  email_otp_verified_at TIMESTAMPTZ,
  totp_required BOOLEAN NOT NULL DEFAULT false,
  totp_verified_at TIMESTAMPTZ,
  verification_attempts INTEGER NOT NULL DEFAULT 0,
  resend_count INTEGER NOT NULL DEFAULT 0,
  last_otp_sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supabase_login_challenges_user
  ON supabase_login_challenges (user_id, expires_at DESC);

COMMIT;
