const { query } = require('../config/db');

const ConversationModel = {
  async create({ organizationId, title = null, type = 'direct', createdBy }) {
    const res = await query(
      `INSERT INTO conversations (organization_id, title, type, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [organizationId, title, type, createdBy]
    );
    return res.rows[0];
  },

  async addParticipant(conversationId, userId) {
    const res = await query(
      `INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (conversation_id, user_id) DO NOTHING
       RETURNING *`,
      [conversationId, userId]
    );
    return res.rows[0];
  },

  async findDirectBetweenUsers(organizationId, user1Id, user2Id) {
    const res = await query(
      `SELECT c.*
       FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
       WHERE c.organization_id = $1
         AND c.type = 'direct'
         AND cp1.user_id = $2
         AND cp2.user_id = $3`,
      [organizationId, user1Id, user2Id]
    );
    return res.rows[0] || null;
  },

  async findById(id) {
    const res = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (!res.rows[0]) return null;

    const conv = res.rows[0];
    const partRes = await query(
      `SELECT cp.*, u.first_name, u.last_name, u.email, u.avatar_url, r.name as role_name
       FROM conversation_participants cp
       JOIN users u ON cp.user_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE cp.conversation_id = $1`,
      [id]
    );
    conv.participants = partRes.rows;

    return conv;
  },

  async isParticipant(conversationId, userId) {
    const res = await query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    return res.rows.length > 0;
  },

  async findUserConversations({ userId, organizationId, limit = 10, offset = 0 }) {
    const sql = `
      SELECT c.*,
        (
          SELECT json_build_object(
            'id', m.id,
            'sender_id', m.sender_id,
            'content', m.content,
            'created_at', m.created_at
          )
          FROM messages m
          WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT COUNT(*)::int
          FROM messages m
          JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = $1
          WHERE m.conversation_id = c.id
            AND m.deleted_at IS NULL
            AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
            AND m.sender_id != $1
        ) AS unread_count,
        (
          SELECT json_agg(
            json_build_object(
              'user_id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'email', u.email,
              'role_name', r.name
            )
          )
          FROM conversation_participants cp2
          JOIN users u ON cp2.user_id = u.id
          JOIN roles r ON u.role_id = r.id
          WHERE cp2.conversation_id = c.id
        ) AS participants
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1 AND c.organization_id = $2
      ORDER BY c.updated_at DESC
      LIMIT $3 OFFSET $4
    `;

    const res = await query(sql, [userId, organizationId, limit, offset]);
    return res.rows;
  },

  async countUserConversations({ userId, organizationId }) {
    const sql = `
      SELECT COUNT(DISTINCT c.id)::int AS count
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1 AND c.organization_id = $2
    `;
    const res = await query(sql, [userId, organizationId]);
    return parseInt(res.rows[0].count, 10);
  },

  async updateLastReadAt(conversationId, userId) {
    const res = await query(
      `UPDATE conversation_participants
       SET last_read_at = NOW()
       WHERE conversation_id = $1 AND user_id = $2
       RETURNING *`,
      [conversationId, userId]
    );
    return res.rows[0] || null;
  },

  async touchUpdatedAt(conversationId) {
    await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [conversationId]);
  },
};

module.exports = ConversationModel;
