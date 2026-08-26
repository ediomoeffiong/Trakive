const { query } = require('../config/db');

const AuditLogModel = {
  async log({ organizationId, userId, action, entityType, entityId, details, ipAddress, userAgent }) {
    const res = await query(
      `INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [organizationId, userId, action, entityType, entityId, JSON.stringify(details || {}), ipAddress, userAgent]
    );
    return res.rows[0];
  },

  async findPaginated({ organizationId = null, userId = null, action = null, entityType = null, startDate = null, endDate = null, limit = 10, offset = 0, sort = 'created_at:desc' }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organizationId) {
      whereClauses.push(`a.organization_id = $${idx}`);
      values.push(organizationId);
      idx++;
    }

    if (userId) {
      whereClauses.push(`a.user_id = $${idx}`);
      values.push(userId);
      idx++;
    }

    if (action) {
      whereClauses.push(`a.action ILIKE $${idx}`);
      values.push(`%${action}%`);
      idx++;
    }

    if (entityType) {
      whereClauses.push(`a.entity_type = $${idx}`);
      values.push(entityType);
      idx++;
    }

    if (startDate) {
      whereClauses.push(`a.created_at >= $${idx}`);
      values.push(startDate);
      idx++;
    }

    if (endDate) {
      whereClauses.push(`a.created_at <= $${idx}`);
      values.push(endDate);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Process sort parameter safely
    let orderBy = 'a.created_at DESC';
    if (sort) {
      const [col, dir] = sort.split(':');
      const allowedCols = ['created_at', 'action', 'entity_type'];
      const orderDir = dir && dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      if (allowedCols.includes(col)) {
        orderBy = `a.${col} ${orderDir}`;
      }
    }

    const sql = `
      SELECT 
        a.id, a.organization_id, a.user_id, a.action, a.entity_type, a.entity_id,
        a.details, a.ip_address, a.user_agent, a.created_at,
        u.first_name AS actor_first_name, u.last_name AS actor_last_name, u.email AS actor_email
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ${whereClauseSql}
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1};
    `;

    values.push(limit, offset);
    const res = await query(sql, values);
    return res.rows;
  },

  async count({ organizationId = null, userId = null, action = null, entityType = null, startDate = null, endDate = null }) {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (organizationId) {
      whereClauses.push(`organization_id = $${idx}`);
      values.push(organizationId);
      idx++;
    }

    if (userId) {
      whereClauses.push(`user_id = $${idx}`);
      values.push(userId);
      idx++;
    }

    if (action) {
      whereClauses.push(`action ILIKE $${idx}`);
      values.push(`%${action}%`);
      idx++;
    }

    if (entityType) {
      whereClauses.push(`entity_type = $${idx}`);
      values.push(entityType);
      idx++;
    }

    if (startDate) {
      whereClauses.push(`created_at >= $${idx}`);
      values.push(startDate);
      idx++;
    }

    if (endDate) {
      whereClauses.push(`created_at <= $${idx}`);
      values.push(endDate);
      idx++;
    }

    const whereClauseSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(id) as count FROM audit_logs ${whereClauseSql};`;
    const res = await query(sql, values);
    return parseInt(res.rows[0].count, 10);
  },
};

module.exports = AuditLogModel;
