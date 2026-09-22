const { query } = require('../config/db');

const EMPTY_SETTINGS = {
  notifications: {},
  appearance: {},
  privacy: {},
  accessibility: {},
  language: {},
  role_preferences: {},
};

const SettingsModel = {
  async findByUserId(userId) {
    const result = await query(
      `SELECT user_id, notifications, appearance, privacy, accessibility,
              language, role_preferences, two_factor_enabled, last_password_change_at,
              created_at, updated_at
       FROM user_settings
       WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0] || null;
  },

  async ensureForUser(userId) {
    const result = await query(
      `INSERT INTO user_settings (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = user_settings.updated_at
       RETURNING user_id, notifications, appearance, privacy, accessibility,
                 language, role_preferences, two_factor_enabled, last_password_change_at,
                 created_at, updated_at`,
      [userId],
    );
    return result.rows[0];
  },

  async updateCategory(userId, category, updates) {
    const columnMap = {
      notifications: 'notifications',
      appearance: 'appearance',
      privacy: 'privacy',
      accessibility: 'accessibility',
      language: 'language',
      role: 'role_preferences',
    };
    const column = columnMap[category];
    if (!column) return this.ensureForUser(userId);

    const result = await query(
      `INSERT INTO user_settings (user_id, ${column})
       VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE
       SET ${column} = user_settings.${column} || EXCLUDED.${column},
           updated_at = NOW()
       RETURNING user_id, notifications, appearance, privacy, accessibility,
                 language, role_preferences, two_factor_enabled, last_password_change_at,
                 created_at, updated_at`,
      [userId, JSON.stringify(updates || {})],
    );
    return result.rows[0];
  },

  async setTwoFactor(userId, enabled) {
    const result = await query(
      `INSERT INTO user_settings (user_id, two_factor_enabled)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET two_factor_enabled = EXCLUDED.two_factor_enabled,
           updated_at = NOW()
       RETURNING user_id, notifications, appearance, privacy, accessibility,
                 language, role_preferences, two_factor_enabled, last_password_change_at,
                 created_at, updated_at`,
      [userId, Boolean(enabled)],
    );
    return result.rows[0];
  },

  async setPasswordChanged(userId) {
    const result = await query(
      `INSERT INTO user_settings (user_id, last_password_change_at)
       VALUES ($1, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET last_password_change_at = NOW(),
           updated_at = NOW()
       RETURNING user_id, notifications, appearance, privacy, accessibility,
                 language, role_preferences, two_factor_enabled, last_password_change_at,
                 created_at, updated_at`,
      [userId],
    );
    return result.rows[0];
  },

  async listActiveSessions(userId) {
    const result = await query(
      `SELECT id, token_hash, ip_address, user_agent, expires_at, created_at, last_seen_at
       FROM refresh_tokens
       WHERE user_id = $1
         AND is_revoked = false
         AND expires_at > NOW()
       ORDER BY last_seen_at DESC, created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  async touchSessionByHash(userId, refreshTokenHash, ipAddress = null, userAgent = null) {
    if (!refreshTokenHash) return null;
    const result = await query(
      `UPDATE refresh_tokens
       SET last_seen_at = NOW(),
           ip_address = COALESCE($3, ip_address),
           user_agent = COALESCE($4, user_agent)
       WHERE user_id = $1
         AND token_hash = $2
         AND is_revoked = false
         AND expires_at > NOW()
       RETURNING id`,
      [userId, refreshTokenHash, ipAddress, userAgent],
    );
    return result.rows[0] || null;
  },

  async revokeSession(userId, sessionId) {
    const result = await query(
      `UPDATE refresh_tokens
       SET is_revoked = true,
           revoked_at = NOW()
       WHERE user_id = $1
         AND id = $2
         AND is_revoked = false
       RETURNING id`,
      [userId, sessionId],
    );
    return result.rows[0] || null;
  },

  async revokeOtherSessions(userId, currentRefreshTokenHash) {
    const params = [userId];
    let keepCurrent = '';
    if (currentRefreshTokenHash) {
      params.push(currentRefreshTokenHash);
      keepCurrent = 'AND token_hash <> $2';
    }

    const result = await query(
      `UPDATE refresh_tokens
       SET is_revoked = true,
           revoked_at = NOW()
       WHERE user_id = $1
         AND is_revoked = false
         AND expires_at > NOW()
         ${keepCurrent}
       RETURNING id`,
      params,
    );
    return result.rowCount;
  },
};

SettingsModel.EMPTY_SETTINGS = EMPTY_SETTINGS;

module.exports = SettingsModel;
