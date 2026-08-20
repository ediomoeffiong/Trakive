const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/;
const passwordMessage =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';

const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().pattern(passwordPattern).required().messages({
      'string.pattern.base': passwordMessage,
    }),
    first_name: Joi.string().min(2).max(50).required().trim(),
    last_name: Joi.string().min(2).max(50).required().trim(),
    role: Joi.string()
      .valid('intern', 'supervisor', 'hr', 'head', 'department_head', 'admin', 'org_admin', 'super_admin')
      .optional()
      .default('intern'),
    phone: Joi.string().max(30).optional().allow('', null),
    organization_id: Joi.string().uuid().optional().allow(null),
    department_id: Joi.string().uuid().optional().allow(null),
  }),
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
