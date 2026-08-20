const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  code: Joi.string().trim().max(50).allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  head_user_id: Joi.string().uuid().allow(null).optional(),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional(),
  code: Joi.string().trim().max(50).allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  head_user_id: Joi.string().uuid().allow(null).optional(),
});

const assignHeadSchema = Joi.object({
  head_user_id: Joi.string().uuid().required(),
});

const assignSupervisorsSchema = Joi.object({
  supervisor_user_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const listDepartmentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignHeadSchema,
  assignSupervisorsSchema,
  listDepartmentsQuerySchema,
};
