const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const WeeklyPlanService = require('../services/weeklyPlan.service');

const getWeeklyPlan = asyncHandler(async (req, res) => {
  const { week_start } = req.query;
  const result = await WeeklyPlanService.getInternWeeklyPlans({ week_start }, req.user);
  return sendSuccess(res, { message: 'Weekly plan retrieved successfully', data: result });
});

const getWeeklyTasks = asyncHandler(async (req, res) => {
  const { weekStart } = req.params;
  const { intern_id } = req.query;
  const targetInternId = intern_id || req.user.id;
  const tasks = await WeeklyPlanService.getWeeklyTasks(targetInternId, weekStart, req.user);
  return sendSuccess(res, { message: 'Weekly tasks retrieved successfully', data: tasks });
});

const addWeeklyTask = asyncHandler(async (req, res) => {
  const { weekStart } = req.params;
  const task = await WeeklyPlanService.addTaskToWeek(req.user.id, weekStart, req.body, req.user);
  return sendSuccess(res, { statusCode: 201, message: 'Task added to weekly plan', data: task });
});

const updateWeeklyTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { end_of_week_status, weekly_note } = req.body;
  const result = await WeeklyPlanService.updateTaskStatus(taskId, { end_of_week_status, weekly_note }, req.user);
  return sendSuccess(res, { message: 'Task status updated', data: result });
});

const submitWeeklyReport = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const result = await WeeklyPlanService.submitWeeklyReport(planId, req.user);
  return sendSuccess(res, { message: 'Weekly report submitted for review', data: result });
});

const reviewWeeklyReport = asyncHandler(async (req, res) => {
  const { planId } = req.params;
  const { action, feedback } = req.body;
  const result = await WeeklyPlanService.reviewWeeklyReport(planId, { action, feedback }, req.user);
  return sendSuccess(res, { message: 'Weekly report reviewed', data: result });
});

const supervisorWeeklyView = asyncHandler(async (req, res) => {
  const result = await WeeklyPlanService.listSupervisorWeekly(req.query, req.user);
  return sendSuccess(res, {
    message: 'Weekly plans retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

module.exports = {
  getWeeklyPlan,
  getWeeklyTasks,
  addWeeklyTask,
  updateWeeklyTaskStatus,
  submitWeeklyReport,
  reviewWeeklyReport,
  supervisorWeeklyView,
};
