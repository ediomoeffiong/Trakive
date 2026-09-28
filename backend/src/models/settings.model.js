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
              language, role_preferences, two_factor_enabled, two_factor_secret,
              two_factor_pending_secret, two_factor_enabled_at, last_password_change_at,
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
                 language, role_preferences, two_factor_enabled, two_factor_secret,
                 two_factor_pending_secret, two_factor_enabled_at, last_password_change_at,
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
                 language, role_preferences, two_factor_enabled, two_factor_secret,
                 two_factor_pending_secret, two_factor_enabled_at, last_password_change_at,
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
                 language, role_preferences, two_factor_enabled, two_factor_secret,
                 two_factor_pending_secret, two_factor_enabled_at, last_password_change_at,
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
                 language, role_preferences, two_factor_enabled, two_factor_secret,
                 two_factor_pending_secret, two_factor_enabled_at, last_password_change_at,
                 created_at, updated_at`,
      [userId],
    );
    return result.rows[0];
  },

  async setPendingTwoFactorSecret(userId, encryptedSecret) {
    const result = await query(
      `INSERT INTO user_settings (user_id, two_factor_pending_secret)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET two_factor_pending_secret = EXCLUDED.two_factor_pending_secret,
           updated_at = NOW()
       RETURNING *`,
      [userId, encryptedSecret],
    );
    return result.rows[0];
  },

  async enableTwoFactor(userId) {
    const result = await query(
      `UPDATE user_settings
       SET two_factor_secret = two_factor_pending_secret,
           two_factor_pending_secret = NULL,
           two_factor_enabled = true,
           two_factor_enabled_at = NOW(),
           updated_at = NOW()
       WHERE user_id = $1 AND two_factor_pending_secret IS NOT NULL
       RETURNING *`,
      [userId],
    );
    return result.rows[0] || null;
  },

  async disableTwoFactor(userId) {
    const result = await query(
      `UPDATE user_settings
       SET two_factor_secret = NULL,
           two_factor_pending_secret = NULL,
           two_factor_enabled = false,
           two_factor_enabled_at = NULL,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [userId],
    );
    return result.rows[0] || null;
  },

  async listActiveSessions(userId) {
    const result = await query(
      `SELECT id, token_hash, family_id, ip_address, user_agent, expires_at, created_at, last_seen_at, is_revoked, revoked_at
       FROM (
         SELECT DISTINCT ON (family_id) id, token_hash, family_id, ip_address, user_agent, expires_at, created_at, last_seen_at, is_revoked, revoked_at
         FROM refresh_tokens
         WHERE user_id = $1
           AND is_revoked = false
           AND expires_at > NOW()
           AND COALESCE(last_seen_at, created_at) > NOW() - INTERVAL '7 days'
         ORDER BY family_id, last_seen_at DESC, created_at DESC
       ) active_devices
       ORDER BY last_seen_at DESC, created_at DESC
       LIMIT 7`,
      [userId],
    );
    return result.rows;
  },

  async countActiveSessions(userId) {
    const result = await query(
      `SELECT COUNT(DISTINCT family_id)::int AS count
       FROM refresh_tokens
       WHERE user_id = $1
         AND is_revoked = false
         AND expires_at > NOW()
         AND COALESCE(last_seen_at, created_at) > NOW() - INTERVAL '7 days'`,
      [userId],
    );
    return parseInt(result.rows[0]?.count, 10) || 0;
  },

  async listOtherSessions(userId, { limit = 10, offset = 0, maxRecords = 100 } = {}) {
    const result = await query(
      `WITH past_sessions AS (
         SELECT DISTINCT ON (family_id)
                id, token_hash, ip_address, user_agent, expires_at, created_at,
                last_seen_at, is_revoked, revoked_at, family_id
         FROM refresh_tokens history
         WHERE history.user_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM refresh_tokens active
             WHERE active.user_id = history.user_id
               AND active.family_id = history.family_id
               AND active.is_revoked = false
               AND active.expires_at > NOW()
               AND COALESCE(active.last_seen_at, active.created_at) > NOW() - INTERVAL '7 days'
           )
         ORDER BY family_id, created_at DESC
       ), limited_history AS (
         SELECT * FROM past_sessions
         ORDER BY COALESCE(revoked_at, last_seen_at, created_at) DESC
         LIMIT $4
       )
       SELECT id, token_hash, ip_address, user_agent, expires_at, created_at, last_seen_at, is_revoked, revoked_at
       FROM limited_history
       ORDER BY COALESCE(revoked_at, last_seen_at, created_at) DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset, maxRecords],
    );
    return result.rows;
  },

  async countOtherSessions(userId, maxRecords = 100) {
    const result = await query(
      `SELECT LEAST(COUNT(DISTINCT history.family_id), $2)::int AS count
       FROM refresh_tokens history
       WHERE history.user_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM refresh_tokens active
           WHERE active.user_id = history.user_id
             AND active.family_id = history.family_id
             AND active.is_revoked = false
             AND active.expires_at > NOW()
             AND COALESCE(active.last_seen_at, active.created_at) > NOW() - INTERVAL '7 days'
         )`,
      [userId, maxRecords],
    );
    return parseInt(result.rows[0]?.count, 10) || 0;
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
         AND COALESCE(last_seen_at, created_at) > NOW() - INTERVAL '7 days'
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
         AND family_id = (
           SELECT family_id FROM refresh_tokens WHERE user_id = $1 AND id = $2
         )
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
      keepCurrent = `AND family_id <> COALESCE(
        (SELECT family_id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2),
        '00000000-0000-0000-0000-000000000000'::uuid
      )`;
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
