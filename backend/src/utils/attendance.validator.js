const Joi = require('joi');

const uuid = Joi.string().uuid();
const weekdays = Joi.array().items(Joi.number().integer().min(1).max(7)).min(1);

const checkInSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  accuracy: Joi.number().min(0).max(50000).allow(null).optional(),
  internship_record_id: uuid.optional(),
  manual: Joi.boolean().optional(),
  auto: Joi.boolean().optional(),
});

const correctionRequestSchema = Joi.object({
  date: Joi.string().isoDate().optional(),
  reason: Joi.string().trim().min(8).max(2000).required(),
  location_state: Joi.string().max(40).allow('', null).optional(),
  latitude: Joi.number().min(-90).max(90).allow(null).optional(),
  longitude: Joi.number().min(-180).max(180).allow(null).optional(),
  accuracy: Joi.number().min(0).allow(null).optional(),
  internship_record_id: uuid.optional(),
});

const manualAttendanceSchema = Joi.object({
  intern_id: uuid.required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  status: Joi.string().valid(
    'present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday'
  ).required(),
  reason: Joi.string().trim().min(5).max(2000).required(),
  notes: Joi.string().allow('', null).optional(),
  internship_record_id: uuid.optional(),
});

const reviewCorrectionSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  reviewer_notes: Joi.string().allow('', null).optional(),
  attendance_status: Joi.string().valid(
    'present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday'
  ).optional(),
});

const officeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  code: Joi.string().trim().max(50).allow('', null).optional(),
  address: Joi.string().allow('', null).optional(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius_m: Joi.number().integer().min(20).max(5000).optional(),
  is_active: Joi.boolean().optional(),
});

const officeUpdateSchema = officeSchema.fork(
  ['name', 'latitude', 'longitude'],
  (s) => s.optional()
);

const policySchema = Joi.object({
  timezone: Joi.string().max(80).optional(),
  country_code: Joi.string().length(2).uppercase().optional(),
  required_arrival_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  grace_minutes: Joi.number().integer().min(0).max(240).optional(),
  default_radius_m: Joi.number().integer().min(20).max(5000).optional(),
  max_accuracy_m: Joi.number().integer().min(10).max(2000).optional(),
});

const departmentScheduleSchema = Joi.object({
  weekdays: weekdays.required(),
});

const overrideSchema = Joi.object({
  scope_type: Joi.string().valid('department', 'intern').required(),
  department_id: uuid.optional(),
  intern_id: uuid.optional(),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  weekdays: weekdays.optional(),
  kind: Joi.string().valid(
    'schedule', 'remote', 'office_closed', 'company_event', 'training', 'excused', 'non_working', 'required'
  ).required(),
  reason: Joi.string().trim().min(5).max(2000).required(),
});

const holidaySchema = Joi.object({
  holiday_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  name: Joi.string().trim().min(2).max(255).required(),
  kind: Joi.string().valid('org_holiday', 'office_closed', 'company_event', 'training', 'non_working').optional(),
  is_recurring: Joi.boolean().optional(),
  notes: Joi.string().allow('', null).optional(),
});

const performanceSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  attendance_weight: Joi.number().min(0).max(1).optional(),
  task_weight: Joi.number().min(0).max(1).optional(),
  rating_weight: Joi.number().min(0).max(1).optional(),
  present_points: Joi.number().min(0).max(1).optional(),
  late_points: Joi.number().min(0).max(1).optional(),
  remote_points: Joi.number().min(0).max(1).optional(),
});

const idParamSchema = Joi.object({
  id: uuid.required(),
});

const departmentIdParamSchema = Joi.object({
  departmentId: uuid.required(),
});

module.exports = {
  checkInSchema,
  correctionRequestSchema,
  manualAttendanceSchema,
  reviewCorrectionSchema,
  officeSchema,
  officeUpdateSchema,
  policySchema,
  departmentScheduleSchema,
  overrideSchema,
  holidaySchema,
  performanceSchema,
  idParamSchema,
  departmentIdParamSchema,
};
