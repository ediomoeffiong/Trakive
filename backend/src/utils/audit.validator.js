const Joi = require('joi');

const listAuditLogsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  userId: Joi.string().uuid().allow('', null).optional(),
  user_id: Joi.string().uuid().allow('', null).optional(),
  action: Joi.string().trim().allow('', null).optional(),
  entityType: Joi.string().trim().allow('', null).optional(),
  entity_type: Joi.string().trim().allow('', null).optional(),
  startDate: Joi.date().iso().allow('', null).optional(),
  start_date: Joi.date().iso().allow('', null).optional(),
  endDate: Joi.date().iso().allow('', null).optional(),
  end_date: Joi.date().iso().allow('', null).optional(),
  sort: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  listAuditLogsQuerySchema,
};
