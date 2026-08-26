const Joi = require('joi');

const LEAVE_TYPES = ['sick', 'casual', 'academic', 'emergency', 'other'];
const LEAVE_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'];

const submitLeaveSchema = Joi.object({
  leave_type: Joi.string().valid(...LEAVE_TYPES).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.min': 'End date must be greater than or equal to start date',
  }),
  reason: Joi.string().trim().min(5).max(1000).required(),
});

const reviewLeaveSchema = Joi.object({
  reviewer_comment: Joi.string().trim().allow('', null).optional(),
});

const listLeaveQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(...LEAVE_STATUSES).allow('', null).optional(),
  leave_type: Joi.string().valid(...LEAVE_TYPES).allow('', null).optional(),
  start_date: Joi.date().iso().allow('', null).optional(),
  end_date: Joi.date().iso().allow('', null).optional(),
  intern_id: Joi.string().uuid().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  sort_by: Joi.string().valid('created_at', 'start_date', 'end_date', 'status', 'leave_type').default('created_at'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  LEAVE_TYPES,
  LEAVE_STATUSES,
  submitLeaveSchema,
  reviewLeaveSchema,
  listLeaveQuerySchema,
};
