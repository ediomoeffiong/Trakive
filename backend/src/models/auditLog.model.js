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
};

module.exports = AuditLogModel;
