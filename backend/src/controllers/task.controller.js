const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const TaskModel = require('../models/task.model');
const SearchService = require('../services/search.service');
const DocumentService = require('../services/document.service');
const { TASK_DELIVERABLE_UPLOAD_TYPES } = require('../utils/uploadSecurity');

function formatFileSize(bytes) {
  const megabytes = Number(bytes || 0) / (1024 * 1024);
  return `${megabytes.toFixed(2)} MB`;
}

function mapSubmission(submission) {
  const attachment = Array.isArray(submission.attachments) ? submission.attachments[0] : null;
  const statusMap = {
    pending_review: 'submitted',
    approved: 'completed',
    revision_requested: 'needs-revision',
    rejected: 'needs-revision',
  };
  return {
    id: submission.id,
    taskId: submission.task_id,
    version: submission.version,
    status: statusMap[submission.status] || submission.status,
    submittedAt: submission.submitted_at,
    fileName: attachment?.fileName || 'Deliverable',
    fileSize: attachment?.fileSizeLabel || formatFileSize(attachment?.fileSize),
    mimeType: attachment?.mimeType || '',
    documentId: attachment?.documentId || null,
    feedback: submission.feedback || null,
    feedbackAuthor: submission.feedback_author || null,
    feedbackDate: submission.feedback_date || null,
  };
}

const TaskController = {
  getTasks: asyncHandler(async (req, res) => {
    const result = await SearchService.searchTasks(req.query, req.user);
    return sendSuccess(res, {
      message: 'Tasks retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  submitDeliverable: asyncHandler(async (req, res) => {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      throw ApiError.notFound(`Task with ID ${req.params.id} not found`);
    }
    if (task.assignee_id !== req.user.id) {
      throw ApiError.forbidden('Only the assigned intern can submit a deliverable for this task');
    }
    if (task.organization_id !== req.user.organization_id) {
      throw ApiError.forbidden('This task does not belong to your organization');
    }

    let document;
    try {
      document = await DocumentService.uploadDocument(req.file, {
        title: `Deliverable - ${task.title}`,
        category: 'submission',
        owner_id: req.user.id,
        is_private: 'true',
      }, req.user, TASK_DELIVERABLE_UPLOAD_TYPES);

      const submission = await TaskModel.createSubmission({
        task_id: task.id,
        intern_id: req.user.id,
        submission_text: req.body.note || null,
        attachments: [{
          documentId: document.id,
          fileName: document.name,
          fileSize: document.size,
          fileSizeLabel: formatFileSize(document.size),
          mimeType: document.mimeType,
        }],
      });
      await TaskModel.updateStatus(task.id, 'in_review');

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Task deliverable submitted successfully',
        data: mapSubmission(submission),
      });
    } catch (error) {
      if (document?.id) {
        await DocumentService.deleteDocument(document.id, req.user).catch(() => {});
      }
      throw error;
    }
  }),

  getTaskById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task with ID ${id} not found`);
    }
    task.submissions = (task.submissions || []).map(mapSubmission);
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
