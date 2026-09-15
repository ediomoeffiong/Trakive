const Joi = require('joi');

const createApplicationSchema = Joi.object({
  internship_id: Joi.string().uuid().required(),
  first_name: Joi.string().trim().min(1).max(100).optional(),
  last_name: Joi.string().trim().min(1).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
  institution: Joi.string().trim().max(255).allow('', null).optional(),
  field_of_study: Joi.string().trim().max(255).allow('', null).optional(),
  academic_year: Joi.string().trim().max(50).allow('', null).optional(),
  cover_letter: Joi.string().trim().allow('', null).optional(),
});

const reviewApplicationSchema = Joi.object({
  status: Joi.string().valid('under_review', 'accepted', 'approved', 'rejected').required(),
  notes: Joi.string().trim().allow('', null).optional(),
});

const createInternAccountFromAppSchema = Joi.object({
  password: Joi.string().min(8).optional(),
});

const submitOnboardingInfoSchema = Joi.object({
  application_id: Joi.string().uuid().optional(),
  department_id: Joi.string().uuid().optional(),
  start_date: Joi.string().isoDate().optional(),
  end_date: Joi.string().isoDate().optional(),
  emergency_contact: Joi.object({
    name: Joi.string().required(),
    relationship: Joi.string().required(),
    phone: Joi.string().required(),
  }).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  institution: Joi.string().trim().optional(),
  field_of_study: Joi.string().trim().optional(),
  academic_year: Joi.string().trim().optional(),
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
];

const submitDocumentSchema = Joi.object({
  application_id: Joi.string().uuid().optional(),
  title: Joi.string().trim().required(),
  file_name: Joi.string().trim().required(),
  file_path: Joi.string().trim().required(),
  file_size: Joi.number().integer().min(1).max(10 * 1024 * 1024).required().messages({
    'number.max': 'File size must not exceed 10 MB',
  }),
  mime_type: Joi.string().trim().valid(...ALLOWED_MIME_TYPES).required().messages({
    'any.only': 'Only PDF documents (.pdf) are allowed as input.',
  }),
  category: Joi.string().valid(
    'resume',
    'placement_letter',
    'acceptance_letter',
    'id_proof',
    'agreement',
    'report',
    'submission',
    'general'
  ).required(),
});

const reviewDocumentSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'resubmission_required').required(),
  notes: Joi.string().trim().when('status', {
    is: Joi.valid('rejected', 'resubmission_required'),
    then: Joi.string().trim().min(1).required().messages({
      'string.empty': 'A comment or reason is required when rejecting or requesting resubmission.',
      'any.required': 'A comment or reason is required when rejecting or requesting resubmission.',
    }),
    otherwise: Joi.string().trim().allow('', null).optional(),
  }),
});

const assignSupervisorOnboardingSchema = Joi.object({
  application_id: Joi.string().uuid().optional(),
  intern_id: Joi.string().uuid().optional(),
  department_id: Joi.string().uuid().required(),
  supervisor_id: Joi.string().uuid().required(),
});

const completeOnboardingSchema = Joi.object({
  application_id: Joi.string().uuid().optional(),
  intern_id: Joi.string().uuid().optional(),
});

module.exports = {
  createApplicationSchema,
  reviewApplicationSchema,
  createInternAccountFromAppSchema,
  submitOnboardingInfoSchema,
  submitDocumentSchema,
  reviewDocumentSchema,
  assignSupervisorOnboardingSchema,
  completeOnboardingSchema,
};
