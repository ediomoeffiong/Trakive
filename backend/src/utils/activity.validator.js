const Joi = require('joi');

const listActivityQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  entity_type: Joi.string().trim().allow('', null).optional(),
  action: Joi.string().trim().allow('', null).optional(),
  user_id: Joi.string().uuid().allow('', null).optional(),
  start_date: Joi.date().iso().allow('', null).optional(),
  end_date: Joi.date().iso().allow('', null).optional(),
  sort_by: Joi.string().valid('created_at', 'action', 'entity_type').default('created_at'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  listActivityQuerySchema,
};
