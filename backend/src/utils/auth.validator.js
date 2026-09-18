const Joi = require('joi');
const { passwordPattern, passwordMessage } = require('./passwordPolicy');

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().pattern(passwordPattern).required().messages({
      'string.pattern.base': passwordMessage,
    }),
    name: Joi.string().min(3).max(120).optional().trim(),
    first_name: Joi.string().min(2).max(50).optional().trim(),
    last_name: Joi.string().min(2).max(50).optional().trim(),
    role: Joi.string()
      .invalid('super_admin', 'superadmin', 'org_admin', 'admin')
      .valid('intern', 'supervisor', 'hr', 'head', 'department_head')
      .optional()
      .default('intern'),
    phone: Joi.string().max(30).optional().allow('', null),
    date_of_birth: Joi.date().iso().optional().allow('', null),
    organization_id: Joi.string().uuid().optional().allow(null),
    department_id: Joi.string().uuid().optional().allow(null),
  }).or('name', 'first_name').with('first_name', 'last_name'),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required(),
  }),
};

const refreshSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(passwordPattern).required().messages({
      'string.pattern.base': passwordMessage,
    }),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().pattern(passwordPattern).required().messages({
      'string.pattern.base': passwordMessage,
    }),
  }),
};

const verifyEmailSchema = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
};
