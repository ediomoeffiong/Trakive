const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AuditService = require('../services/audit.service');

const AuditLogController = {
  listAuditLogs: asyncHandler(async (req, res) => {
    const result = await AuditService.listAuditLogs(req.query, req.user);
    return sendSuccess(res, {
      message: 'Audit logs retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),
};

module.exports = AuditLogController;
