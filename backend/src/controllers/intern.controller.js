const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const InternService = require('../services/intern.service');

const createIntern = asyncHandler(async (req, res) => {
  const result = await InternService.createIntern(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Intern created successfully',
    data: result,
  });
});

const getIntern = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await InternService.getIntern(id, req.user);
  return sendSuccess(res, {
    message: 'Intern details retrieved successfully',
    data: result,
  });
});

const updateIntern = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await InternService.updateIntern(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Intern details updated successfully',
    data: result,
  });
});

const listInterns = asyncHandler(async (req, res) => {
  const result = await InternService.listInterns(req.query, req.user);
  return sendSuccess(res, {
    message: 'Interns retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const updateInternStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await InternService.updateInternStatus(id, status, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: `Intern status updated to ${status} successfully`,
    data: result,
  });
});

const assignDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { department_id } = req.body;
  const result = await InternService.assignDepartment(id, department_id, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Department assigned to intern successfully',
    data: result,
  });
});

const assignSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { supervisor_id } = req.body;
  const result = await InternService.assignSupervisor(id, supervisor_id, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Supervisor assigned to intern successfully',
    data: result,
  });
});

const getInternHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await InternService.getInternHistory(id, req.user);
  return sendSuccess(res, {
    message: 'Internship status and history retrieved successfully',
    data: result,
  });
});

module.exports = {
  createIntern,
  getIntern,
  updateIntern,
  listInterns,
  updateInternStatus,
  assignDepartment,
  assignSupervisor,
  getInternHistory,
};
