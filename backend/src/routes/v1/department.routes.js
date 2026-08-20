const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignHeadSchema,
  assignSupervisorsSchema,
  listDepartmentsQuerySchema,
} = require('../../utils/department.validator');
const {
  createDepartment,
  updateDepartment,
  assignHead,
  assignSupervisors,
  deactivateDepartment,
  listDepartments,
  getDepartmentWithStaff,
} = require('../../controllers/department.controller');

const router = express.Router();

router.get('/', authenticate, validate({ query: listDepartmentsQuerySchema }), listDepartments);
router.post('/', authenticate, requireRole('admin', 'hr'), validate({ body: createDepartmentSchema }), createDepartment);
router.get('/:id', authenticate, getDepartmentWithStaff);
router.put('/:id', authenticate, requireRole('admin', 'hr'), validate({ body: updateDepartmentSchema }), updateDepartment);
router.patch('/:id/status', authenticate, requireRole('admin', 'hr'), deactivateDepartment);
router.post('/:id/head', authenticate, requireRole('admin', 'hr'), validate({ body: assignHeadSchema }), assignHead);
router.post('/:id/supervisors', authenticate, requireRole('admin', 'hr'), validate({ body: assignSupervisorsSchema }), assignSupervisors);
router.get('/:id/staff', authenticate, getDepartmentWithStaff);

module.exports = router;
