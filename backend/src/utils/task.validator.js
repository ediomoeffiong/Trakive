const Joi = require('joi');

const TASK_STATUSES = [
  'draft',
  'todo',
  'assigned',
  'in_progress',
  'submitted',
  'in_review',
  'under_review',
  'approved',
  'completed',
  'rejected',
  'resubmitted',
  'revision_requested',
];

const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().trim().allow('', null).optional(),
  assignee_id: Joi.string().uuid().required(),
  priority: Joi.string().valid(...TASK_PRIORITIES).default('medium'),
  status: Joi.string().valid(...TASK_STATUSES).optional(),
  due_date: Joi.date().iso().allow(null).optional(),
  department_id: Joi.string().uuid().allow(null).optional(),
  internship_id: Joi.string().uuid().allow(null).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  assignee_id: Joi.string().uuid().optional(),
  priority: Joi.string().valid(...TASK_PRIORITIES).optional(),
  status: Joi.string().valid(...TASK_STATUSES).optional(),
  due_date: Joi.date().iso().allow(null).optional(),
  department_id: Joi.string().uuid().allow(null).optional(),
  internship_id: Joi.string().uuid().allow(null).optional(),
});

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid(...TASK_STATUSES).required(),
});

const submitTaskSchema = Joi.object({
  submission_text: Joi.string().trim().allow('', null).optional(),
  attachments: Joi.array().items(
    Joi.object({
      file_name: Joi.string().optional(),
      file_path: Joi.string().optional(),
      file_size: Joi.number().optional(),
      mime_type: Joi.string().optional(),
      url: Joi.string().optional(),
    }).unknown(true)
  ).optional().default([]),
});

const reviewTaskSchema = Joi.object({
  submission_id: Joi.string().uuid().allow(null).optional(),
  status: Joi.string().valid('approved', 'rejected', 'revision_requested').required(),
  rating: Joi.number().integer().min(1).max(5).allow(null).optional(),
  feedback: Joi.string().trim().allow('', null).optional(),
});

const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).required(),
});

const listTasksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null).optional(),
  status: Joi.string().allow('', null).optional(),
  priority: Joi.string().valid(...TASK_PRIORITIES).allow('', null).optional(),
  assignee_id: Joi.string().uuid().allow('', null).optional(),
  creator_id: Joi.string().uuid().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  sort_by: Joi.string().valid('created_at', 'due_date', 'updated_at', 'priority', 'status', 'title').default('created_at'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  submitTaskSchema,
  reviewTaskSchema,
  createCommentSchema,
  listTasksQuerySchema,
};
