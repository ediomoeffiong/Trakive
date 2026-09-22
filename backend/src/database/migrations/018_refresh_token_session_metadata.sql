-- Add live session metadata to refresh-token records used by Settings > Sessions & Devices.

ALTER TABLE refresh_tokens
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

UPDATE refresh_tokens
SET last_seen_at = COALESCE(last_seen_at, created_at, NOW())
WHERE last_seen_at IS NULL;

UPDATE refresh_tokens
SET revoked_at = COALESCE(revoked_at, NOW())
WHERE is_revoked = true
  AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active_sessions
ON refresh_tokens (user_id, is_revoked, expires_at, last_seen_at DESC);
