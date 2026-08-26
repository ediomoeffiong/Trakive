const AuditLogModel = require('../models/auditLog.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const AuditService = {
  async log({ organizationId, userId, action, entityType, entityId, details, ipAddress, userAgent }) {
    return await AuditLogModel.log({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
    });
  },

  async listAuditLogs(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    
    // Organization scoping: non-super_admin sees only their organization
    const organizationId = reqRole === 'super_admin' ? null : requestingUser.organization_id;
    const userId = query.userId || query.user_id || null;
    const action = query.action || null;
    const entityType = query.entityType || query.entity_type || null;
    const startDate = query.startDate || query.start_date || null;
    const endDate = query.endDate || query.end_date || null;
    const sort = query.sort || 'created_at:desc';

    const logs = await AuditLogModel.findPaginated({
      organizationId,
      userId,
      action,
      entityType,
      startDate,
      endDate,
      limit,
      offset,
      sort,
    });

    const totalItems = await AuditLogModel.count({
      organizationId,
      userId,
      action,
      entityType,
      startDate,
      endDate,
    });

    return formatPaginatedResponse(logs, totalItems, page, limit);
  },
};

module.exports = AuditService;
