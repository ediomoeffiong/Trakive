const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const TaskService = require('../services/task.service');

const createTask = asyncHandler(async (req, res) => {
  const result = await TaskService.createTask(req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created and assigned successfully',
    data: result,
  });
});

const getTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getTask(id, req.user);
  return sendSuccess(res, {
    message: 'Task details retrieved successfully',
    data: result,
  });
});

const listTasks = asyncHandler(async (req, res) => {
  const result = await TaskService.listTasks(req.query, req.user);
  return sendSuccess(res, {
    message: 'Tasks retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.updateTask(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Task updated successfully',
    data: result,
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await TaskService.updateTaskStatus(id, status, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: `Task status updated to ${status} successfully`,
    data: result,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.deleteTask(id, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Task archived successfully',
    data: result,
  });
});

const submitTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.submitTask(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task work submitted successfully',
    data: result,
  });
});

const getTaskSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getSubmissions(id, req.user);
  return sendSuccess(res, {
    message: 'Task submission history retrieved successfully',
    data: result,
  });
});

const reviewTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.reviewTask(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: `Task submission review completed with status '${result.status}'`,
    data: result,
  });
});

const getTaskReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getReviews(id, req.user);
  return sendSuccess(res, {
    message: 'Task review history retrieved successfully',
    data: result,
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.addComment(id, req.body, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added to task successfully',
    data: result,
  });
});

const getTaskComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getComments(id, req.user);
  return sendSuccess(res, {
    message: 'Task comments retrieved successfully',
    data: result,
  });
});

const getTaskActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await TaskService.getActivities(id, req.user);
  return sendSuccess(res, {
    message: 'Task activity history retrieved successfully',
    data: result,
  });
});

module.exports = {
  createTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  submitTask,
  getTaskSubmissions,
  reviewTask,
  getTaskReviews,
  addComment,
  getTaskComments,
  getTaskActivity,
};
