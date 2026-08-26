const Joi = require('joi');

const uuidSchema = Joi.string().uuid({ version: 'uuidv4' });
const dateSchema = Joi.string().isoDate();

const analyticsQuerySchema = Joi.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  departmentId: uuidSchema.optional(),
  supervisorId: uuidSchema.optional(),
  internId: uuidSchema.optional(),
  status: Joi.string().trim().optional(),
  priority: Joi.string().trim().optional(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day').optional(),
});

const reportQuerySchema = Joi.object({
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  departmentId: uuidSchema.optional(),
  supervisorId: uuidSchema.optional(),
  internId: uuidSchema.optional(),
  status: Joi.string().trim().optional(),
  priority: Joi.string().trim().optional(),
  search: Joi.string().trim().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  analyticsQuerySchema,
  reportQuerySchema,
};
