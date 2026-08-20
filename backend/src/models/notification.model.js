const { query } = require('../config/db');

const NotificationModel = {
  async findByUserId(userId) {
    const res = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  },
};

module.exports = NotificationModel;
