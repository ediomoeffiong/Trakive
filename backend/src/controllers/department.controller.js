const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const DepartmentService = require('../services/department.service');

const createDepartment = asyncHandler(async (req, res) => {
  const result = await DepartmentService.createDepartment(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Department created successfully',
    data: result,
  });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await DepartmentService.updateDepartment(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Department updated successfully',
    data: result,
  });
});

const assignHead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { head_user_id } = req.body;
  const result = await DepartmentService.assignHead(id, head_user_id, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Department head assigned successfully',
    data: result,
  });
});

const assignSupervisors = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { supervisor_user_ids } = req.body;
  const result = await DepartmentService.assignSupervisors(id, supervisor_user_ids, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Supervisors assigned to department successfully',
    data: result,
  });
});

const deactivateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await DepartmentService.deactivateDepartment(id, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Department deactivated successfully',
    data: result,
  });
});

const listDepartments = asyncHandler(async (req, res) => {
  const result = await DepartmentService.listDepartments(req.query, req.user);
  return sendSuccess(res, {
    message: 'Departments retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getDepartmentWithStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await DepartmentService.getDepartmentWithStaff(id, req.user);
  return sendSuccess(res, {
    message: 'Department details and staff retrieved successfully',
    data: result,
  });
});

module.exports = {
  createDepartment,
  updateDepartment,
  assignHead,
  assignSupervisors,
  deactivateDepartment,
  listDepartments,
  getDepartmentWithStaff,
};
