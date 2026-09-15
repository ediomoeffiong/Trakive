const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { listAuditLogsQuerySchema } = require('../../utils/audit.validator');
const AuditLogController = require('../../controllers/auditLog.controller');

const router = express.Router();

router.get(
  '/',
  authenticate,
  requireRole('admin', 'hr', 'supervisor', 'department_head', 'head', 'super_admin'),
  validate({ query: listAuditLogsQuerySchema }),
  AuditLogController.listAuditLogs
);

module.exports = router;
