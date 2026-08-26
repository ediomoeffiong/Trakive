const { query } = require('../config/db');

const NotificationModel = {
  async create({ userId, title, message, type = 'system', linkUrl = null }) {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type, link_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await query(sql, [userId, title, message, type, linkUrl]);
    return res.rows[0];
  },

  async findByUserId(userId) {
    const res = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return res.rows;
  },

  async findPaginated({
    user_id = null,
    type = '',
    is_read = null,
    search = '',
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
      whereClauses.push(`n.user_id = $${idx}`);
      values.push(user_id);
      idx++;
    }

    if (type) {
      whereClauses.push(`n.type = $${idx}`);
      values.push(type);
      idx++;
    }

    if (is_read !== null && is_read !== undefined && is_read !== '') {
      whereClauses.push(`n.is_read = $${idx}`);
      values.push(is_read === 'true' || is_read === true);
      idx++;
    }

    if (search) {
      whereClauses.push(`(n.title ILIKE $${idx} OR n.message ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`n.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`n.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'n.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'is_read', 'type'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `n.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT n.*
      FROM notifications n
      ${whereClauseSql}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({
    user_id = null,
    type = '',
    is_read = null,
    search = '',
    start_date = null,
    end_date = null,
  }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (user_id) {
      whereClauses.push(`n.user_id = $${idx}`);
      values.push(user_id);
      idx++;
    }

    if (type) {
      whereClauses.push(`n.type = $${idx}`);
      values.push(type);
      idx++;
    }

    if (is_read !== null && is_read !== undefined && is_read !== '') {
      whereClauses.push(`n.is_read = $${idx}`);
      values.push(is_read === 'true' || is_read === true);
      idx++;
    }

    if (search) {
      whereClauses.push(`(n.title ILIKE $${idx} OR n.message ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (start_date) {
      whereClauses.push(`n.created_at >= $${idx}`);
      values.push(start_date);
      idx++;
    }

    if (end_date) {
      whereClauses.push(`n.created_at <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(n.id) as count
      FROM notifications n
      ${whereClauseSql};
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },

  async existsSimilar({ userId, type, linkUrl, createdWithinHours = 24 }) {
    const sql = `
      SELECT id FROM notifications
      WHERE user_id = $1
        AND type = $2
        AND ($3::text IS NULL OR link_url = $3)
        AND created_at >= (NOW() - ($4 || ' hours')::INTERVAL)
      LIMIT 1;
    `;
    const res = await query(sql, [userId, type, linkUrl, createdWithinHours]);
    return res.rows.length > 0;
  },
};

module.exports = NotificationModel;
