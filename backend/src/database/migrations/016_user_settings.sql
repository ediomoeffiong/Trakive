-- User-specific portal settings and persisted preferences.

CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    appearance JSONB NOT NULL DEFAULT '{}'::jsonb,
    privacy JSONB NOT NULL DEFAULT '{}'::jsonb,
    accessibility JSONB NOT NULL DEFAULT '{}'::jsonb,
    language JSONB NOT NULL DEFAULT '{}'::jsonb,
    role_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    last_password_change_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at);
