const { query } = require('../config/db');

const ActivityModel = {
  async findActivities({
    organizationId,
    userId,
    entityType,
    action,
    startDate,
    endDate,
    limit = 10,
    offset = 0,
    sortBy = 'created_at',
    order = 'DESC',
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`al.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (userId) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      values.push(userId);
    }

    if (entityType) {
      conditions.push(`al.entity_type = $${paramIndex++}`);
      values.push(entityType);
    }

    if (action) {
      conditions.push(`al.action ILIKE $${paramIndex++}`);
      values.push(`%${action}%`);
    }

    if (startDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      values.push(endDate);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortBy = ['created_at', 'action', 'entity_type'].includes(sortBy)
      ? `al.${sortBy}`
      : 'al.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT al.*,
             u.first_name AS user_first_name,
             u.last_name AS user_last_name,
             u.email AS user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async countActivities({
    organizationId,
    userId,
    entityType,
    action,
    startDate,
    endDate,
  }) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (organizationId) {
      conditions.push(`al.organization_id = $${paramIndex++}`);
      values.push(organizationId);
    }

    if (userId) {
      conditions.push(`al.user_id = $${paramIndex++}`);
      values.push(userId);
    }

    if (entityType) {
      conditions.push(`al.entity_type = $${paramIndex++}`);
      values.push(entityType);
    }

    if (action) {
      conditions.push(`al.action ILIKE $${paramIndex++}`);
      values.push(`%${action}%`);
    }

    if (startDate) {
      conditions.push(`al.created_at >= $${paramIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`al.created_at <= $${paramIndex++}`);
      values.push(endDate);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT COUNT(*) AS total
      FROM audit_logs al
      ${whereClause}
    `;

    const res = await query(sql, values);
    return parseInt(res.rows[0].total, 10);
  },
};

module.exports = ActivityModel;
