const Joi = require('joi');

const searchQuerySchema = Joi.object({
  search: Joi.string().trim().allow('', null).optional(),
  status: Joi.string().trim().allow('', null).optional(),
  departmentId: Joi.string().uuid().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  supervisorId: Joi.string().uuid().allow('', null).optional(),
  supervisor_id: Joi.string().uuid().allow('', null).optional(),
  internId: Joi.string().uuid().allow('', null).optional(),
  intern_id: Joi.string().uuid().allow('', null).optional(),
  startDate: Joi.date().iso().allow('', null).optional(),
  start_date: Joi.date().iso().allow('', null).optional(),
  endDate: Joi.date().iso().allow('', null).optional(),
  end_date: Joi.date().iso().allow('', null).optional(),
  priority: Joi.string().trim().valid('low', 'medium', 'high', 'urgent').allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional(),
  type: Joi.string().trim().allow('', null).optional(),
  role: Joi.string().trim().allow('', null).optional(),
  is_read: Joi.boolean().allow('', null).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  searchQuerySchema,
};
