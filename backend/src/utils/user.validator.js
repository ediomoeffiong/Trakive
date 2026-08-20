const Joi = require('joi');

const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(1).max(100).optional(),
  last_name: Joi.string().trim().min(1).max(100).optional(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
  institution: Joi.string().trim().max(255).allow('', null).optional(),
  field_of_study: Joi.string().trim().max(255).allow('', null).optional(),
  academic_year: Joi.string().trim().max(50).allow('', null).optional(),
  emergency_contact: Joi.object({
    name: Joi.string().allow('', null),
    relationship: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  title: Joi.string().trim().max(100).allow('', null).optional(),
  bio: Joi.string().trim().allow('', null).optional(),
  specialization: Joi.string().trim().max(255).allow('', null).optional(),
});

const updateAvatarSchema = Joi.object({
  avatar_url: Joi.string().trim().uri().required().messages({
    'any.required': 'avatar_url is required',
    'string.uri': 'avatar_url must be a valid URL',
  }),
});

const userStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').required(),
});

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('', null).optional(),
  role: Joi.string().trim().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').allow('', null).optional(),
});

module.exports = {
  updateProfileSchema,
  updateAvatarSchema,
  userStatusSchema,
  listUsersQuerySchema,
};
