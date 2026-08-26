const { query } = require('../config/db');

const MessageModel = {
  async create({ conversationId, senderId, content, attachments = [] }) {
    const res = await query(
      `INSERT INTO messages (conversation_id, sender_id, content, attachments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, senderId, content, JSON.stringify(attachments)]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await query('SELECT * FROM messages WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.rows[0] || null;
  },

  async findConversationMessages({ conversationId, limit = 20, offset = 0 }) {
    const sql = `
      SELECT m.*,
             u.first_name AS sender_first_name,
             u.last_name AS sender_last_name,
             u.email AS sender_email,
             u.avatar_url AS sender_avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const res = await query(sql, [conversationId, limit, offset]);
    return res.rows;
  },

  async countConversationMessages(conversationId) {
    const res = await query(
      'SELECT COUNT(*)::int AS count FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL',
      [conversationId]
    );
    return parseInt(res.rows[0].count, 10);
  },

  async softDelete(id, senderId) {
    const res = await query(
      'UPDATE messages SET deleted_at = NOW() WHERE id = $1 AND sender_id = $2 RETURNING *',
      [id, senderId]
    );
    return res.rows[0] || null;
  },
};

module.exports = MessageModel;
