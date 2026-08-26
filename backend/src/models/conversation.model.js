const { query } = require('../config/db');

const ConversationModel = {
  async findById(id) {
    const res = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  async findPaginatedMessages({
    user_id = null,
    organization_id = null,
    search = '',
    sender_id = null,
    start_date = null,
    end_date = null,
    limit = 10,
    offset = 0,
    sort = 'created_at:desc',
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (user_id) {
      whereClauses.push(`m.conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = $${idx}
      )`);
      values.push(user_id);
      idx++;
    }

    if (organization_id) {
      whereClauses.push(`c.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`m.content ILIKE $${idx}`);
      values.push(`%${search}%`);
      idx++;
    }

    if (sender_id) {
      whereClauses.push(`m.sender_id = $${idx}`);
      values.push(sender_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`m.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`m.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'm.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `m.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        m.id, m.conversation_id, m.sender_id, m.content, m.attachments, m.created_at, m.updated_at,
        s.first_name AS sender_first_name, s.last_name AS sender_last_name, s.email AS sender_email,
        c.title AS conversation_title, c.type AS conversation_type
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      JOIN users s ON s.id = m.sender_id
      ${whereClauseSql}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async countMessages({
    user_id = null,
    organization_id = null,
    search = '',
    sender_id = null,
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (user_id) {
      whereClauses.push(`m.conversation_id IN (
        SELECT conversation_id FROM conversation_participants WHERE user_id = $${idx}
      )`);
      values.push(user_id);
      idx++;
    }

    if (organization_id) {
      whereClauses.push(`c.organization_id = $${idx}`);
      values.push(organization_id);
      idx++;
    }

    if (search) {
      whereClauses.push(`m.content ILIKE $${idx}`);
      values.push(`%${search}%`);
      idx++;
    }

    if (sender_id) {
      whereClauses.push(`m.sender_id = $${idx}`);
      values.push(sender_id);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`m.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`m.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(m.id) as count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      ${whereClauseSql};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },
};

module.exports = ConversationModel;
