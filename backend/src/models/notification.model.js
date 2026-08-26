const { query } = require('../config/db');

const NotificationModel = {
  async create({ userId, title, message, type = 'system', linkUrl = null }) {
    const res = await query(
      `INSERT INTO notifications (user_id, title, message, type, link_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type, linkUrl]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findUserNotifications({ userId, type = null, isRead = null, limit = 10, offset = 0 }) {
    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];
    let paramIdx = 2;

    if (type) {
      sql += ` AND type = $${paramIdx++}`;
      params.push(type);
    }

    if (isRead !== null && isRead !== undefined) {
      sql += ` AND is_read = $${paramIdx++}`;
      params.push(isRead === 'true' || isRead === true);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  },

  async countUserNotifications({ userId, type = null, isRead = null }) {
    let sql = 'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1';
    const params = [userId];
    let paramIdx = 2;

    if (type) {
      sql += ` AND type = $${paramIdx++}`;
      params.push(type);
    }

    if (isRead !== null && isRead !== undefined) {
      sql += ` AND is_read = $${paramIdx++}`;
      params.push(isRead === 'true' || isRead === true);
    }

    const res = await query(sql, params);
    return parseInt(res.rows[0].count, 10);
  },

  async getUnreadCount(userId) {
    const res = await query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(res.rows[0].count, 10);
  },

  async markAsRead(id, userId) {
    const res = await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return res.rows[0] || null;
  },

  async markAllAsRead(userId) {
    const res = await query(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false
       RETURNING *`,
      [userId]
    );
    return res.rows;
  },

  async delete(id, userId) {
    const res = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return res.rows[0] || null;
  },
};

module.exports = NotificationModel;
