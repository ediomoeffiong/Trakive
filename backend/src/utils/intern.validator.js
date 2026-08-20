const Joi = require('joi');

const createInternSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).optional(),
  first_name: Joi.string().trim().min(1).max(100).required(),
  last_name: Joi.string().trim().min(1).max(100).required(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
  department_id: Joi.string().uuid().allow(null).optional(),
  supervisor_id: Joi.string().uuid().allow(null).optional(),
  institution: Joi.string().trim().max(255).allow('', null).optional(),
  field_of_study: Joi.string().trim().max(255).allow('', null).optional(),
  academic_year: Joi.string().trim().max(50).allow('', null).optional(),
  emergency_contact: Joi.object({
    name: Joi.string().allow('', null),
    relationship: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
});

const updateInternSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional(),
  last_name: Joi.string().trim().min(1).max(100).optional(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
  department_id: Joi.string().uuid().allow(null).optional(),
  supervisor_id: Joi.string().uuid().allow(null).optional(),
  institution: Joi.string().trim().max(255).allow('', null).optional(),
  field_of_study: Joi.string().trim().max(255).allow('', null).optional(),
  academic_year: Joi.string().trim().max(50).allow('', null).optional(),
  emergency_contact: Joi.object({
    name: Joi.string().allow('', null),
    relationship: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('onboarding', 'active', 'completed', 'terminated').optional(),
});

const assignDepartmentSchema = Joi.object({
  department_id: Joi.string().uuid().required(),
});

const assignSupervisorSchema = Joi.object({
  supervisor_id: Joi.string().uuid().required(),
});

const updateInternStatusSchema = Joi.object({
  status: Joi.string().valid('onboarding', 'active', 'completed', 'terminated').required(),
});

const listInternsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  supervisor_id: Joi.string().uuid().allow('', null).optional(),
  status: Joi.string().valid('onboarding', 'active', 'completed', 'terminated').allow('', null).optional(),
});

module.exports = {
  createInternSchema,
  updateInternSchema,
  assignDepartmentSchema,
  assignSupervisorSchema,
  updateInternStatusSchema,
  listInternsQuerySchema,
};
