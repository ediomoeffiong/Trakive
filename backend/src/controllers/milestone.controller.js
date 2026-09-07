const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const MilestoneService = require('../services/milestone.service');

const listMilestones = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const result = await MilestoneService.listMilestones(projectId, req.user);
  return sendSuccess(res, { message: 'Milestones retrieved successfully', data: result });
});

const createMilestone = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const result = await MilestoneService.createMilestone(projectId, req.body, req.user);
  return sendSuccess(res, { statusCode: 201, message: 'Milestone created successfully', data: result });
});

const updateMilestone = asyncHandler(async (req, res) => {
  const { id: projectId, milestoneId } = req.params;
  const result = await MilestoneService.updateMilestone(projectId, milestoneId, req.body, req.user);
  return sendSuccess(res, { message: 'Milestone updated successfully', data: result });
});

const deleteMilestone = asyncHandler(async (req, res) => {
  const { id: projectId, milestoneId } = req.params;
  await MilestoneService.deleteMilestone(projectId, milestoneId, req.user);
  return sendSuccess(res, { message: 'Milestone deleted successfully', data: { deleted: true, milestoneId } });
});

const reorderMilestones = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { ordered_ids } = req.body;
  const result = await MilestoneService.reorderMilestones(projectId, ordered_ids, req.user);
  return sendSuccess(res, { message: 'Milestones reordered successfully', data: result });
});

module.exports = {
  listMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
};
