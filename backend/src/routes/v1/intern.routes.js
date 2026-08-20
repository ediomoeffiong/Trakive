const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  createInternSchema,
  updateInternSchema,
  assignDepartmentSchema,
  assignSupervisorSchema,
  updateInternStatusSchema,
  listInternsQuerySchema,
} = require('../../utils/intern.validator');
const {
  createIntern,
  getIntern,
  updateIntern,
  listInterns,
  updateInternStatus,
  assignDepartment,
  assignSupervisor,
  getInternHistory,
} = require('../../controllers/intern.controller');

const router = express.Router();

router.get('/', authenticate, requireRole('admin', 'hr', 'head', 'supervisor'), validate({ query: listInternsQuerySchema }), listInterns);
router.post('/', authenticate, requireRole('admin', 'hr'), validate({ body: createInternSchema }), createIntern);
router.get('/:id', authenticate, getIntern);
router.put('/:id', authenticate, requireRole('admin', 'hr', 'supervisor'), validate({ body: updateInternSchema }), updateIntern);
router.patch('/:id/status', authenticate, requireRole('admin', 'hr'), validate({ body: updateInternStatusSchema }), updateInternStatus);
router.patch('/:id/department', authenticate, requireRole('admin', 'hr'), validate({ body: assignDepartmentSchema }), assignDepartment);
router.patch('/:id/supervisor', authenticate, requireRole('admin', 'hr', 'head'), validate({ body: assignSupervisorSchema }), assignSupervisor);
router.get('/:id/profile', authenticate, getIntern);
router.get('/:id/history', authenticate, getInternHistory);

module.exports = router;
