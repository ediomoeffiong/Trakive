const Joi = require('joi');

const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'on_leave', 'half_day', 'excused'];

const clockInSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
});

const clockOutSchema = Joi.object({
  notes: Joi.string().trim().allow('', null).optional(),
});

const updateAttendanceSchema = Joi.object({
  status: Joi.string().valid(...ATTENDANCE_STATUSES).optional(),
  notes: Joi.string().trim().allow('', null).optional(),
});

const listAttendanceQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  start_date: Joi.date().iso().allow('', null).optional(),
  end_date: Joi.date().iso().allow('', null).optional(),
  status: Joi.string().valid(...ATTENDANCE_STATUSES).allow('', null).optional(),
  intern_id: Joi.string().uuid().allow('', null).optional(),
  department_id: Joi.string().uuid().allow('', null).optional(),
  sort_by: Joi.string().valid('date', 'created_at', 'status', 'check_in', 'check_out', 'work_duration_minutes').default('date'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC'),
});

module.exports = {
  ATTENDANCE_STATUSES,
  clockInSchema,
  clockOutSchema,
  updateAttendanceSchema,
  listAttendanceQuerySchema,
};
