const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ProjectService = require('../services/project.service');

const createProject = asyncHandler(async (req, res) => {
  const result = await ProjectService.createProject(req.body, req.user);
  return sendSuccess(res, { statusCode: 201, message: 'Project created successfully', data: result });
});

const proposeProject = asyncHandler(async (req, res) => {
  const result = await ProjectService.proposeProject(req.body, req.user);
  return sendSuccess(res, { statusCode: 201, message: 'Project proposal submitted successfully', data: result });
});

const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.getProject(id, req.user);
  return sendSuccess(res, { message: 'Project retrieved successfully', data: result });
});

const listProjects = asyncHandler(async (req, res) => {
  const result = await ProjectService.listProjects(req.query, req.user);
  return sendSuccess(res, { message: 'Projects retrieved successfully', data: result.items, meta: result.pagination });
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.updateProject(id, req.body, req.user);
  return sendSuccess(res, { message: 'Project updated successfully', data: result });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.deleteProject(id, req.user);
  return sendSuccess(res, { message: 'Project deleted successfully', data: result });
});

const approveProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.approveProject(id, req.user);
  return sendSuccess(res, { message: 'Project approved successfully', data: result });
});

const rejectProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const result = await ProjectService.rejectProject(id, reason, req.user);
  return sendSuccess(res, { message: 'Project rejected', data: result });
});

const requestChanges = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  const result = await ProjectService.requestChanges(id, feedback, req.user);
  return sendSuccess(res, { message: 'Changes requested on project', data: result });
});

const resubmitProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await ProjectService.resubmitProject(id, req.body, req.user);
  return sendSuccess(res, { message: 'Project resubmitted for approval', data: result });
});

module.exports = {
  createProject,
  proposeProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
  approveProject,
  rejectProject,
  requestChanges,
  resubmitProject,
};
