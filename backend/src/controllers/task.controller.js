const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const TaskModel = require('../models/task.model');
const SearchService = require('../services/search.service');

const TaskController = {
  getTasks: asyncHandler(async (req, res) => {
    const result = await SearchService.searchTasks(req.query, req.user);
    return sendSuccess(res, {
      message: 'Tasks retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  getTaskById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    return sendSuccess(res, {
      message: 'Task retrieved successfully',
      data: task,
    });
  }),

  createTask: asyncHandler(async (req, res) => {
    const {
      title,
      description,
      priority = 'medium',
      status = 'todo',
      due_date = null,
      assignee_id = null,
      department_id = null,
      internship_id = null,
      project_id = null,
      milestone_id = null,
      task_source = 'supervisor_assigned',
      week_start = null,
      weekly_note = null,
    } = req.body;

    if (!title) {
      throw ApiError.badRequest('Task title is required');
    }

    const newTask = await TaskModel.create({
      organization_id: req.user.organization_id || null,
      department_id: department_id || req.user.department_id || null,
      internship_id,
      creator_id: req.user.id,
      assignee_id: assignee_id || req.user.id,
      title,
      description,
      priority,
      status,
      due_date,
      project_id,
      milestone_id,
      task_source,
      week_start,
      weekly_note,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Task created successfully',
      data: newTask,
    });
  }),

  updateTask: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await TaskModel.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }

    const updatedTask = await TaskModel.update(id, req.body);
    return sendSuccess(res, {
      message: 'Task updated successfully',
      data: updatedTask,
    });
  }),

  updateTaskStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const existing = await TaskModel.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }

    const updatedTask = await TaskModel.updateStatus(id, status);
    return sendSuccess(res, {
      message: 'Task status updated successfully',
      data: updatedTask,
    });
  }),

  deleteTask: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await TaskModel.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }

    await TaskModel.softDelete(id);
    return sendSuccess(res, {
      message: 'Task deleted successfully',
      data: { id },
    });
  }),
};

module.exports = TaskController;
