const Joi = require('joi');

const uuid = Joi.string().guid({ version: ['uuidv4', 'uuidv5'] });

const coordinateSchema = {
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  accuracy_meters: Joi.number().min(0).max(100000).allow(null),
  source: Joi.string().valid('auto', 'manual').default('manual'),
  user_agent: Joi.string().max(1000).allow('', null),
};

const checkInSchema = Joi.object(coordinateSchema);

const correctionSchema = Joi.object({
  attendance_id: uuid.allow(null),
  date: Joi.date().iso(),
  requested_status: Joi.string().valid('present', 'late', 'excused', 'remote').default('present'),
  reason: Joi.string().min(5).max(1000).required(),
  location_payload: Joi.object().unknown(true).default({}),
});

const historyQuerySchema = Joi.object({
  intern_id: uuid,
  internship_record_id: uuid,
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
});

const dashboardQuerySchema = Joi.object({
  date: Joi.date().iso(),
  department_id: uuid,
  intern_id: uuid,
  internship_record_id: uuid,
  office_id: uuid,
  format: Joi.string().valid('csv', 'pdf'),
});

const officeSchema = Joi.object({
  id: uuid,
  name: Joi.string().min(2).max(255).required(),
  address: Joi.string().max(1000).allow('', null),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius_meters: Joi.number().integer().min(10).max(5000).default(200),
  is_active: Joi.boolean().default(true),
});

const policySchema = Joi.object({
  department_id: uuid.allow(null),
  required_weekdays: Joi.array().items(Joi.number().integer().min(0).max(6)).min(0).max(7).default([2, 3, 4]),
  arrival_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).default('08:00'),
  grace_minutes: Joi.number().integer().min(0).max(240).default(60),
  timezone: Joi.string().max(100).default('Africa/Lagos'),
  attendance_score_enabled: Joi.boolean().default(true),
  attendance_score_weight: Joi.number().min(0).max(100).default(30),
});

const overrideSchema = Joi.object({
  department_id: uuid.allow(null),
  intern_id: uuid.allow(null),
  internship_record_id: uuid.allow(null),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso(),
  required: Joi.boolean().allow(null),
  status: Joi.string().valid('remote', 'excused', 'public_holiday', 'non_workday').allow(null),
  reason: Joi.string().min(3).max(1000).required(),
});

const holidaySchema = Joi.object({
  date: Joi.date().iso().required(),
  name: Joi.string().min(2).max(255).required(),
});

const manualAttendanceSchema = Joi.object({
  intern_id: uuid.required(),
  internship_record_id: uuid,
  date: Joi.date().iso().required(),
  status: Joi.string().valid('present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday').required(),
  check_in: Joi.date().iso().allow(null),
  notes: Joi.string().max(1000).allow('', null),
  reason: Joi.string().min(5).max(1000).required(),
});

const reviewCorrectionSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reason: Joi.string().max(1000).allow('', null),
});

const idParamSchema = Joi.object({
  id: uuid.required(),
});

module.exports = {
  checkInSchema,
  correctionSchema,
  historyQuerySchema,
  dashboardQuerySchema,
  officeSchema,
  policySchema,
  overrideSchema,
  holidaySchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  idParamSchema,
};
