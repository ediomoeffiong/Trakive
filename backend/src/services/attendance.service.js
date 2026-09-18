const { pool, query } = require('../config/db');
const ApiError = require('../utils/apiError');
const NotificationModel = require('../models/notification.model');
const ProfileModel = require('../models/profile.model');
const InternshipRecordModel = require('../models/internshipRecord.model');

const DEFAULT_TIMEZONE = process.env.ATTENDANCE_TIMEZONE || 'Africa/Lagos';
const DEFAULT_REQUIRED_WEEKDAYS = [2, 3, 4];
const DEFAULT_RADIUS_METERS = 200;
const DEFAULT_GRACE_MINUTES = 60;
const MAX_TRUSTED_ACCURACY_METERS = Number(process.env.ATTENDANCE_MAX_ACCURACY_METERS || 150);
const HOLIDAY_PROVIDER_URL = process.env.NIGERIA_HOLIDAY_API_URL || 'https://date.nager.at/api/v3/PublicHolidays/{year}/NG';

const PHYSICAL_SUCCESS_STATUSES = new Set(['present', 'late']);
const CREDIT_STATUSES = new Set(['present', 'late', 'remote', 'excused']);
const EXCLUDED_REQUIRED_STATUSES = new Set(['public_holiday', 'non_workday']);

function normalizeRole(user) {
  return (user?.role_name || '').toLowerCase();
}

function localParts(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdayMap[parts.weekday],
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function parseTimeToMinutes(time = '08:00') {
  const [h, m] = String(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toNumber(value, field) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw ApiError.badRequest(`${field} must be a valid number`);
  return n;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const earth = 6371000;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function makeSimplePdf(title, lines) {
  const safe = (text) => String(text).replace(/[()\\]/g, '\\$&');
  const body = [
    'BT',
    '/F1 16 Tf',
    '50 780 Td',
    `(${safe(title)}) Tj`,
    '/F1 10 Tf',
    '0 -24 Td',
    ...lines.slice(0, 42).flatMap((line) => [`(${safe(line).slice(0, 110)}) Tj`, '0 -14 Td']),
    'ET',
  ].join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(body)} >> stream\n${body}\nendstream endobj`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${obj}\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

async function getSupervisorProfile(user) {
  let profile = await ProfileModel.findSupervisorProfileByUserId(user.id);
  if (!profile && user.organization_id) {
    profile = await ProfileModel.upsertSupervisorProfile({
      user_id: user.id,
      organization_id: user.organization_id,
      department_id: user.department_id,
    });
  }
  return profile;
}

async function getActiveInternship(internId) {
  const existing = await InternshipRecordModel.findActiveByUserId(internId);
  if (existing) return existing;

  const profile = await ProfileModel.findInternProfileByUserId(internId);
  if (!profile?.organization_id) return null;

  const today = new Date();
  const sixMonths = new Date(today);
  sixMonths.setMonth(sixMonths.getMonth() + 6);

  return InternshipRecordModel.create({
    user_id: internId,
    organization_id: profile.organization_id,
    department_id: profile.department_id || null,
    supervisor_id: profile.supervisor_id || null,
    start_date: today.toISOString().slice(0, 10),
    end_date: sixMonths.toISOString().slice(0, 10),
    status: profile.status === 'active' ? 'active' : 'onboarding',
    work_location: profile.work_location || null,
    work_hours: profile.work_hours || null,
    days_per_week: profile.days_per_week || 5,
    title: 'Internship #1',
  });
}

async function assertCanAccessIntern(user, internId) {
  const role = normalizeRole(user);
  if (role === 'intern') {
    if (user.id !== internId) throw ApiError.forbidden('Interns can only access their own attendance');
    return;
  }
  if (role === 'supervisor') {
    const profile = await getSupervisorProfile(user);
    if (!profile) throw ApiError.forbidden('Supervisor profile is required');
    const res = await query(
      `SELECT 1
       FROM intern_profiles ip
       LEFT JOIN internship_records ir ON ir.user_id = ip.user_id AND ir.status IN ('active', 'onboarding')
       WHERE ip.user_id = $1 AND (ip.supervisor_id = $2 OR ir.supervisor_id = $2)
       LIMIT 1`,
      [internId, profile.id]
    );
    if (!res.rows[0]) throw ApiError.forbidden('You are not assigned to this intern');
    return;
  }
  if (['admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) return;
  throw ApiError.forbidden('Attendance access denied');
}

async function notifyOnce({ userId, title, message, linkUrl = '/dashboard/attendance', type = 'attendance', hours = 8 }) {
  const exists = await NotificationModel.existsSimilar({ userId, type, linkUrl, createdWithinHours: hours });
  if (!exists) await NotificationModel.create({ userId, title, message, type, linkUrl });
}

async function getOrganizationPolicy(organizationId, departmentId = null) {
  const res = await query(
    `SELECT *
     FROM attendance_policies
     WHERE organization_id = $1 AND (department_id = $2 OR department_id IS NULL)
     ORDER BY department_id IS NULL ASC
     LIMIT 1`,
    [organizationId, departmentId]
  );
  if (res.rows[0]) return res.rows[0];
  return {
    organization_id: organizationId,
    department_id: departmentId,
    required_weekdays: DEFAULT_REQUIRED_WEEKDAYS,
    arrival_time: '08:00:00',
    grace_minutes: DEFAULT_GRACE_MINUTES,
    timezone: DEFAULT_TIMEZONE,
    attendance_score_enabled: true,
    attendance_score_weight: 30,
  };
}

async function cacheNigerianHolidays(organizationId, year) {
  const existing = await query(
    `SELECT * FROM attendance_holidays
     WHERE country_code = 'NG' AND EXTRACT(YEAR FROM date) = $1 AND (organization_id = $2 OR organization_id IS NULL)`,
    [year, organizationId]
  );
  if (existing.rows.length > 0) return existing.rows;

  try {
    const url = HOLIDAY_PROVIDER_URL.replace('{year}', String(year));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Holiday provider returned ${response.status}`);
    const holidays = await response.json();
    for (const holiday of holidays) {
      await query(
        `INSERT INTO attendance_holidays (organization_id, country_code, date, name, source, metadata)
         VALUES ($1, 'NG', $2, $3, 'nager_date', $4::jsonb)
         ON CONFLICT (organization_id, country_code, date, name) DO NOTHING`,
        [organizationId, holiday.date, holiday.localName || holiday.name, JSON.stringify(holiday)]
      );
    }
  } catch {
    // Cached/manual data is sufficient when the provider is unavailable.
  }

  const res = await query(
    `SELECT * FROM attendance_holidays
     WHERE country_code = 'NG' AND EXTRACT(YEAR FROM date) = $1 AND (organization_id = $2 OR organization_id IS NULL)`,
    [year, organizationId]
  );
  return res.rows;
}

async function getHoliday(organizationId, date) {
  const year = Number(String(date).slice(0, 4));
  await cacheNigerianHolidays(organizationId, year);
  const res = await query(
    `SELECT *
     FROM attendance_holidays
     WHERE date = $1 AND country_code = 'NG' AND (organization_id = $2 OR organization_id IS NULL)
     ORDER BY organization_id NULLS LAST
     LIMIT 1`,
    [date, organizationId]
  );
  return res.rows[0] || null;
}

async function getOverride({ organizationId, internId, internshipRecordId, departmentId, date }) {
  const res = await query(
    `SELECT *
     FROM attendance_schedule_overrides
     WHERE organization_id = $1
       AND start_date <= $2 AND end_date >= $2
       AND (
         internship_record_id = $3 OR intern_id = $4 OR department_id = $5
       )
     ORDER BY
       CASE WHEN internship_record_id = $3 THEN 1 WHEN intern_id = $4 THEN 2 ELSE 3 END
     LIMIT 1`,
    [organizationId, date, internshipRecordId, internId, departmentId]
  );
  return res.rows[0] || null;
}

async function resolveDayContext(internId, date = null) {
  const internship = await getActiveInternship(internId);
  if (!internship) throw ApiError.badRequest('No active internship record found for attendance');
  const policy = await getOrganizationPolicy(internship.organization_id, internship.department_id);
  const parts = localParts(new Date(), policy.timezone || DEFAULT_TIMEZONE);
  const attendanceDate = date || parts.date;
  const dateForWeekday = new Date(`${attendanceDate}T12:00:00Z`);
  const weekday = dateForWeekday.getUTCDay();
  const holiday = await getHoliday(internship.organization_id, attendanceDate);
  const override = await getOverride({
    organizationId: internship.organization_id,
    internId,
    internshipRecordId: internship.id,
    departmentId: internship.department_id,
    date: attendanceDate,
  });

  let required = (policy.required_weekdays || DEFAULT_REQUIRED_WEEKDAYS).includes(weekday);
  let derivedStatus = null;
  let reason = null;

  if (holiday) {
    required = false;
    derivedStatus = 'public_holiday';
    reason = holiday.name;
  }
  if (override) {
    if (override.required !== null && override.required !== undefined) required = override.required;
    if (override.status) {
      derivedStatus = override.status;
      if (['remote', 'excused', 'public_holiday', 'non_workday'].includes(override.status)) required = false;
    }
    reason = override.reason;
  }
  if (!required && !derivedStatus) {
    const isWeekday = weekday >= 1 && weekday <= 5;
    derivedStatus = isWeekday ? 'remote' : 'non_workday';
    reason = isWeekday
      ? 'Online day — physical presence is not required'
      : 'No attendance scheduled';
  }

  const arrival = parseTimeToMinutes(policy.arrival_time);
  const cutoff = arrival + Number(policy.grace_minutes || DEFAULT_GRACE_MINUTES);
  const nowParts = localParts(new Date(), policy.timezone || DEFAULT_TIMEZONE);

  return {
    internship,
    policy,
    date: attendanceDate,
    required,
    derivedStatus,
    reason,
    arrivalMinutes: arrival,
    cutoffMinutes: cutoff,
    localNow: nowParts,
    pastGraceWindow: attendanceDate < nowParts.date || (attendanceDate === nowParts.date && nowParts.minutes > cutoff),
  };
}

async function findOffices(organizationId) {
  const res = await query(
    `SELECT * FROM attendance_offices
     WHERE organization_id = $1 AND is_active = true AND deleted_at IS NULL
     ORDER BY name ASC`,
    [organizationId]
  );
  return res.rows;
}

function pickOffice(offices, latitude, longitude) {
  const withDistances = offices.map((office) => ({
    ...office,
    distance_meters: haversineMeters(latitude, longitude, Number(office.latitude), Number(office.longitude)),
  })).sort((a, b) => a.distance_meters - b.distance_meters);
  return withDistances[0] || null;
}

function buildSuspiciousFlags({ accuracy, matchedOffice, offices }) {
  const flags = [];
  if (accuracy > MAX_TRUSTED_ACCURACY_METERS) flags.push('poor_gps_accuracy');
  if (matchedOffice && matchedOffice.distance_meters > Number(matchedOffice.radius_meters)) flags.push('outside_geofence');
  if (offices.filter((office) => office.distance_meters <= Number(office.radius_meters)).length > 1) flags.push('multiple_offices_nearby');
  return flags;
}

function classifyStatus(context) {
  return context.localNow.minutes <= context.cutoffMinutes ? 'present' : 'late';
}

async function getToday(user) {
  await assertCanAccessIntern(user, user.id);
  const context = await resolveDayContext(user.id);
  const existing = await query(
    `SELECT a.*, o.name AS office_name
     FROM attendance a
     LEFT JOIN attendance_offices o ON o.id = a.office_id
     WHERE a.internship_record_id = $1 AND a.date = $2`,
    [context.internship.id, context.date]
  );
  const isOnlineDay = !context.required && context.derivedStatus === 'remote';
  const alreadyCredited = Boolean(existing.rows[0]);
  return {
    date: context.date,
    required: context.required,
    derived_status: context.derivedStatus,
    reason: context.reason,
    is_online_day: isOnlineDay,
    schedule: {
      arrival_time: context.policy.arrival_time,
      grace_minutes: Number(context.policy.grace_minutes),
      timezone: context.policy.timezone,
      required_weekdays: context.policy.required_weekdays,
    },
    already_checked_in: Boolean(existing.rows[0]?.check_in),
    can_check_in: context.required && !existing.rows[0]?.check_in,
    attendance_hint: isOnlineDay
      ? (alreadyCredited
        ? 'Attendance was marked because you completed a task today.'
        : 'Complete a task to mark attendance')
      : null,
    past_grace_window: context.pastGraceWindow,
    record: existing.rows[0] || null,
  };
}

async function creditRemoteAttendanceFromTask(user, { taskId = null, taskTitle = null } = {}) {
  try {
    const context = await resolveDayContext(user.id);
    if (context.required) return null;
    if (context.derivedStatus !== 'remote') return null;

    const existing = await query(
      `SELECT * FROM attendance WHERE internship_record_id = $1 AND date = $2`,
      [context.internship.id, context.date]
    );
    if (existing.rows[0]) return existing.rows[0];

    const inserted = await query(
      `INSERT INTO attendance (
         organization_id, intern_id, internship_record_id, date, check_in, status, notes,
         verification_status, verification_method, verification_metadata, suspicious_flags, source, recorded_at
       )
       VALUES ($1, $2, $3, $4, NOW(), 'remote', $5, 'verified', 'system', $6::jsonb, '[]'::jsonb, 'system', NOW())
       ON CONFLICT (internship_record_id, date) WHERE internship_record_id IS NOT NULL DO NOTHING
       RETURNING *`,
      [
        context.internship.organization_id,
        user.id,
        context.internship.id,
        context.date,
        taskTitle
          ? `Marked by completing task: ${taskTitle}`
          : 'Marked by completing a task on an online work day',
        JSON.stringify({ task_id: taskId, credit_source: 'task_completion' }),
      ]
    );
    return inserted.rows[0] || null;
  } catch {
    return null;
  }
}

async function checkIn(user, payload = {}) {
  if (normalizeRole(user) !== 'intern') throw ApiError.forbidden('Only interns can check in');
  const context = await resolveDayContext(user.id);
  if (!context.required) throw ApiError.badRequest(`Attendance is not required today (${context.reason || context.derivedStatus})`);

  const latitude = toNumber(payload.latitude, 'latitude');
  const longitude = toNumber(payload.longitude, 'longitude');
  const accuracy = payload.accuracy_meters === undefined ? null : toNumber(payload.accuracy_meters, 'accuracy_meters');
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw ApiError.badRequest('Coordinates are outside valid latitude/longitude bounds');
  }

  const offices = await findOffices(context.internship.organization_id);
  if (offices.length === 0) throw ApiError.badRequest('No active attendance offices are configured');
  const matchedOffice = pickOffice(offices, latitude, longitude);
  const officesWithDistance = offices.map((office) => ({
    ...office,
    distance_meters: haversineMeters(latitude, longitude, Number(office.latitude), Number(office.longitude)),
  }));
  const flags = buildSuspiciousFlags({ accuracy: accuracy || 0, matchedOffice, offices: officesWithDistance });

  if (accuracy && accuracy > MAX_TRUSTED_ACCURACY_METERS) {
    throw ApiError.unprocessableEntity('Location accuracy is too low for a reliable office check-in', { code: 'LOCATION_INACCURATE', accuracy_meters: accuracy });
  }
  if (!matchedOffice || matchedOffice.distance_meters > Number(matchedOffice.radius_meters || DEFAULT_RADIUS_METERS)) {
    throw ApiError.unprocessableEntity('You are outside all configured office geofences', {
      code: 'OUTSIDE_GEOFENCE',
      nearest_office: matchedOffice?.name || null,
      distance_meters: matchedOffice ? Math.round(matchedOffice.distance_meters) : null,
    });
  }

  const status = classifyStatus(context);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO attendance (
         organization_id, intern_id, internship_record_id, date, check_in, status, notes,
         office_id, check_in_latitude, check_in_longitude, accuracy_meters, distance_meters,
         verification_status, verification_method, verification_metadata, suspicious_flags, source, recorded_at
       )
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, $11, $12, 'geolocation', $13::jsonb, $14::jsonb, $15, NOW())
       ON CONFLICT (internship_record_id, date) WHERE internship_record_id IS NOT NULL DO NOTHING
       RETURNING *`,
      [
        context.internship.organization_id,
        user.id,
        context.internship.id,
        context.date,
        status,
        status === 'late' ? 'Checked in after grace period' : 'Verified office check-in',
        matchedOffice.id,
        latitude,
        longitude,
        accuracy,
        Math.round(matchedOffice.distance_meters),
        flags.length > 0 ? 'suspicious' : 'verified',
        JSON.stringify({ userAgent: payload.user_agent || null, submittedAccuracy: accuracy }),
        JSON.stringify(flags),
        payload.source === 'auto' ? 'auto' : 'manual',
      ]
    );
    if (!inserted.rows[0]) throw ApiError.conflict('Attendance has already been recorded for today');
    const autoClosedCorrections = await client.query(
      `UPDATE attendance_correction_requests
       SET status = 'rejected',
           attendance_id = COALESCE(attendance_id, $1),
           reviewer_reason = 'Automatically closed because the intern successfully checked in before supervisor review.',
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE intern_id = $2
         AND date = $3
         AND status = 'pending'
       RETURNING *`,
      [inserted.rows[0].id, user.id, context.date]
    );
    await client.query(
      `INSERT INTO attendance_audit_logs (organization_id, attendance_id, actor_id, action, previous_value, new_value, reason)
       VALUES ($1, $2, $3, 'check_in', NULL, $4::jsonb, 'Intern location check-in')`,
      [context.internship.organization_id, inserted.rows[0].id, user.id, JSON.stringify(inserted.rows[0])]
    );
    if (autoClosedCorrections.rows.length > 0) {
      await client.query(
        `INSERT INTO attendance_audit_logs (organization_id, attendance_id, actor_id, action, previous_value, new_value, reason)
         VALUES ($1, $2, $3, 'correction_auto_closed', NULL, $4::jsonb, 'Pending correction request auto-closed after successful check-in')`,
        [context.internship.organization_id, inserted.rows[0].id, user.id, JSON.stringify(autoClosedCorrections.rows)]
      );
    }
    await client.query('COMMIT');

    if (status === 'late') {
      await notifyOnce({
        userId: user.id,
        title: 'Late attendance recorded',
        message: 'Your check-in was recorded after the attendance grace period.',
      });
    }
    return inserted.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function requestCorrection(user, payload = {}) {
  if (normalizeRole(user) !== 'intern') throw ApiError.forbidden('Only interns can request attendance corrections');
  const context = await resolveDayContext(user.id, payload.date);
  if (!payload.reason || String(payload.reason).trim().length < 5) throw ApiError.badRequest('A correction reason is required');
  const existingAttendance = await query(
    `SELECT id FROM attendance
     WHERE internship_record_id = $1 AND date = $2 AND check_in IS NOT NULL
     LIMIT 1`,
    [context.internship.id, context.date]
  );
  if (existingAttendance.rows[0]) {
    throw ApiError.badRequest('Attendance has already been recorded for this date, so a correction request is no longer needed');
  }
  const res = await query(
    `INSERT INTO attendance_correction_requests (
       attendance_id, organization_id, intern_id, internship_record_id, date,
       requested_status, reason, location_payload
     )
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'present'), $7, $8::jsonb)
     RETURNING *`,
    [
      payload.attendance_id || null,
      context.internship.organization_id,
      user.id,
      context.internship.id,
      context.date,
      payload.requested_status,
      String(payload.reason).trim(),
      JSON.stringify(payload.location_payload || {}),
    ]
  );

  const supervisors = await query(
    `SELECT sp.user_id FROM supervisor_profiles sp WHERE sp.id = $1`,
    [context.internship.supervisor_id]
  );
  if (supervisors.rows[0]?.user_id) {
    await notifyOnce({
      userId: supervisors.rows[0].user_id,
      title: 'Attendance correction requested',
      message: 'An intern submitted an attendance correction for review.',
      linkUrl: '/supervisor/attendance',
      hours: 1,
    });
  }
  return res.rows[0];
}

async function listInternHistory(user, filters = {}) {
  const internId = normalizeRole(user) === 'intern' ? user.id : (filters.intern_id || user.id);
  await assertCanAccessIntern(user, internId);
  const internship = filters.internship_record_id
    ? await InternshipRecordModel.findById(filters.internship_record_id)
    : await getActiveInternship(internId);
  if (filters.internship_record_id && (!internship || internship.user_id !== internId)) {
    throw ApiError.forbidden('Attendance access denied for this internship record');
  }

  const startDate = filters.start_date || `${localParts(new Date(), DEFAULT_TIMEZONE).date.slice(0, 8)}01`;
  const endDate = filters.end_date || localParts(new Date(), DEFAULT_TIMEZONE).date;

  const records = internship
    ? await query(
      `SELECT a.*, o.name AS office_name
       FROM attendance a
       LEFT JOIN attendance_offices o ON o.id = a.office_id
       WHERE a.internship_record_id = $1 AND a.date BETWEEN $2 AND $3
       ORDER BY a.date DESC`,
      [internship.id, startDate, endDate]
    )
    : { rows: [] };

  const correctionParams = [internId, startDate, endDate];
  let correctionWhere = 'intern_id = $1 AND date BETWEEN $2 AND $3';
  if (internship) {
    correctionParams.push(internship.id);
    correctionWhere = `(${correctionWhere} OR internship_record_id = $4)`;
  }
  const corrections = await query(
    `SELECT *
     FROM attendance_correction_requests
     WHERE ${correctionWhere}
     ORDER BY created_at DESC
     LIMIT 50`,
    correctionParams
  );

  const stats = internship
    ? await calculateScoreForInternship(internship.id, startDate, endDate)
    : { required_days: 0, credited_days: 0, attendance_percentage: 0 };
  return { records: records.rows, corrections: corrections.rows, stats };
}

async function listSupervisorDashboard(user, filters = {}) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) {
    throw ApiError.forbidden('Supervisor attendance dashboard access denied');
  }

  const supervisorProfile = role === 'supervisor' ? await getSupervisorProfile(user) : null;
  const date = filters.date || localParts(new Date(), DEFAULT_TIMEZONE).date;
  const params = [user.organization_id, date];
  let idx = 3;
  const clauses = ['ir.organization_id = $1', 'ir.status IN (\'active\', \'onboarding\')'];
  if (supervisorProfile) {
    clauses.push(`ir.supervisor_id = $${idx}`);
    params.push(supervisorProfile.id);
    idx++;
  }
  if (filters.department_id) {
    clauses.push(`ir.department_id = $${idx}`);
    params.push(filters.department_id);
    idx++;
  }
  if (filters.intern_id) {
    clauses.push(`ir.user_id = $${idx}`);
    params.push(filters.intern_id);
    idx++;
  }

  const expected = await query(
    `SELECT
       ir.id AS internship_record_id, ir.user_id AS intern_id, ir.department_id,
       u.first_name, u.last_name, u.email, d.name AS department_name,
       a.id AS attendance_id, a.status, a.check_in, a.verification_status,
       a.distance_meters, a.accuracy_meters, a.suspicious_flags, a.notes,
       o.name AS office_name
     FROM internship_records ir
     JOIN users u ON u.id = ir.user_id
     LEFT JOIN departments d ON d.id = ir.department_id
     LEFT JOIN attendance a ON a.internship_record_id = ir.id AND a.date = $2
     LEFT JOIN attendance_offices o ON o.id = a.office_id
     WHERE ${clauses.join(' AND ')}
     ORDER BY u.first_name, u.last_name`,
    params
  );

  const policy = await getOrganizationPolicy(
    user.organization_id,
    supervisorProfile?.department_id || filters.department_id || null
  );
  const holiday = await getHoliday(user.organization_id, date);
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const isWeekday = weekday >= 1 && weekday <= 5;
  const physicalRequired = !holiday && (policy.required_weekdays || DEFAULT_REQUIRED_WEEKDAYS).includes(weekday);
  const dayType = holiday ? 'public_holiday' : (physicalRequired ? 'physical' : (isWeekday ? 'online' : 'non_workday'));

  const roster = expected.rows.map((row) => {
    const required = physicalRequired;
    let status = row.status;
    if (!status) {
      status = required ? 'pending' : (dayType === 'online' ? 'not_required' : dayType);
    }
    return {
      ...row,
      required,
      day_type: dayType,
      status,
    };
  });

  const correctionParams = [user.organization_id];
  let correctionWhere = `acr.organization_id = $1 AND acr.status = 'pending'`;
  if (supervisorProfile) {
    correctionParams.push(supervisorProfile.id);
    correctionWhere += ` AND ir.supervisor_id = $${correctionParams.length}`;
  }
  const corrections = await query(
    `SELECT acr.*, u.first_name, u.last_name, u.email
     FROM attendance_correction_requests acr
     JOIN users u ON u.id = acr.intern_id
     LEFT JOIN internship_records ir ON ir.id = acr.internship_record_id
     WHERE ${correctionWhere}
     ORDER BY acr.created_at DESC
     LIMIT 100`,
    correctionParams
  );

  const counts = roster.reduce((acc, row) => {
    const status = row.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    date,
    day_type: dayType,
    required: physicalRequired,
    reason: holiday
      ? holiday.name
      : (physicalRequired
        ? 'Physical office attendance is required'
        : (dayType === 'online'
          ? 'Online day — physical attendance is not required. Completing a task marks attendance.'
          : 'No attendance scheduled')),
    counts: {
      expected: roster.filter((row) => row.required).length,
      present: counts.present || 0,
      late: counts.late || 0,
      absent: counts.absent || 0,
      remote: counts.remote || 0,
      excused: counts.excused || 0,
      pending: roster.filter((row) => row.required && !row.attendance_id).length,
      not_required: counts.not_required || 0,
    },
    expected: roster,
    correction_queue: corrections.rows,
  };
}

async function listConfiguration(user) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) {
    throw ApiError.forbidden('Attendance configuration access denied');
  }
  const [offices, policies, overrides, holidays] = await Promise.all([
    query(`SELECT * FROM attendance_offices WHERE organization_id = $1 AND deleted_at IS NULL ORDER BY name`, [user.organization_id]),
    query(`SELECT p.*, d.name AS department_name FROM attendance_policies p LEFT JOIN departments d ON d.id = p.department_id WHERE p.organization_id = $1 ORDER BY d.name NULLS FIRST`, [user.organization_id]),
    query(`SELECT * FROM attendance_schedule_overrides WHERE organization_id = $1 ORDER BY start_date DESC LIMIT 100`, [user.organization_id]),
    query(`SELECT * FROM attendance_holidays WHERE organization_id = $1 ORDER BY date DESC LIMIT 100`, [user.organization_id]),
  ]);
  return { offices: offices.rows, policies: policies.rows, overrides: overrides.rows, holidays: holidays.rows };
}

async function upsertOffice(user, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can manage offices');
  const radius = Number(payload.radius_meters || DEFAULT_RADIUS_METERS);
  if (payload.id) {
    const updated = await query(
      `UPDATE attendance_offices
       SET name = $3, address = $4, latitude = $5, longitude = $6,
           radius_meters = $7, is_active = COALESCE($8, is_active), updated_at = NOW()
       WHERE id = $1 AND organization_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [payload.id, user.organization_id, payload.name, payload.address || null, payload.latitude, payload.longitude, radius, payload.is_active]
    );
    if (!updated.rows[0]) throw ApiError.notFound('Attendance office not found');
    return updated.rows[0];
  }

  const res = await query(
    `INSERT INTO attendance_offices (id, organization_id, name, address, latitude, longitude, radius_meters, is_active, created_by)
     VALUES (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, COALESCE($8, true), $9)
     ON CONFLICT (organization_id, name) DO UPDATE SET
       address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
       radius_meters = EXCLUDED.radius_meters, is_active = EXCLUDED.is_active, updated_at = NOW()
     RETURNING *`,
    [payload.id || null, user.organization_id, payload.name, payload.address || null, payload.latitude, payload.longitude, radius, payload.is_active, user.id]
  );
  return res.rows[0];
}

async function upsertPolicy(user, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can manage attendance policy');
  if (!payload.department_id) {
    const existing = await query(
      `SELECT id FROM attendance_policies WHERE organization_id = $1 AND department_id IS NULL LIMIT 1`,
      [user.organization_id]
    );
    if (existing.rows[0]) {
      const updated = await query(
        `UPDATE attendance_policies
         SET required_weekdays = $2::int[], arrival_time = $3::time, grace_minutes = $4, timezone = $5,
             attendance_score_enabled = $6, attendance_score_weight = $7, updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          existing.rows[0].id,
          payload.required_weekdays || DEFAULT_REQUIRED_WEEKDAYS,
          payload.arrival_time || '08:00',
          payload.grace_minutes ?? DEFAULT_GRACE_MINUTES,
          payload.timezone || DEFAULT_TIMEZONE,
          payload.attendance_score_enabled ?? true,
          payload.attendance_score_weight ?? 30,
        ]
      );
      return updated.rows[0];
    }
  }
  const res = await query(
    `INSERT INTO attendance_policies (
       organization_id, department_id, required_weekdays, arrival_time, grace_minutes,
       timezone, attendance_score_enabled, attendance_score_weight, created_by
     )
     VALUES ($1, $2, $3::int[], COALESCE($4::time, '08:00'), COALESCE($5, 60), COALESCE($6, $10), COALESCE($7, true), COALESCE($8, 30), $9)
     ON CONFLICT (organization_id, department_id) DO UPDATE SET
       required_weekdays = EXCLUDED.required_weekdays, grace_minutes = EXCLUDED.grace_minutes,
       timezone = EXCLUDED.timezone, attendance_score_enabled = EXCLUDED.attendance_score_enabled,
       attendance_score_weight = EXCLUDED.attendance_score_weight, updated_at = NOW()
     RETURNING *`,
    [
      user.organization_id,
      payload.department_id || null,
      payload.required_weekdays || DEFAULT_REQUIRED_WEEKDAYS,
      payload.arrival_time || '08:00',
      payload.grace_minutes ?? DEFAULT_GRACE_MINUTES,
      payload.timezone || DEFAULT_TIMEZONE,
      payload.attendance_score_enabled,
      payload.attendance_score_weight,
      user.id,
      DEFAULT_TIMEZONE,
    ]
  );
  return res.rows[0];
}

async function createOverride(user, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can create schedule overrides');
  if (!payload.reason) throw ApiError.badRequest('Override reason is required');
  const res = await query(
    `INSERT INTO attendance_schedule_overrides (
       organization_id, department_id, intern_id, internship_record_id,
       start_date, end_date, required, status, reason, created_by
     )
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, $5), $7, $8, $9, $10)
     RETURNING *`,
    [
      user.organization_id,
      payload.department_id || null,
      payload.intern_id || null,
      payload.internship_record_id || null,
      payload.start_date,
      payload.end_date || payload.start_date,
      payload.required,
      payload.status || null,
      payload.reason,
      user.id,
    ]
  );
  if (payload.intern_id) {
    await notifyOnce({
      userId: payload.intern_id,
      title: 'Attendance schedule changed',
      message: 'A supervisor updated your attendance schedule or status for a date.',
    });
  }
  return res.rows[0];
}

async function addHoliday(user, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can manage holidays');
  const res = await query(
    `INSERT INTO attendance_holidays (organization_id, country_code, date, name, source, created_by)
     VALUES ($1, 'NG', $2, $3, 'manual', $4)
     ON CONFLICT (organization_id, country_code, date, name) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [user.organization_id, payload.date, payload.name, user.id]
  );
  return res.rows[0];
}

async function manualAttendance(user, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can manually correct attendance');
  if (!payload.reason) throw ApiError.badRequest('A reason is required for manual attendance changes');
  await assertCanAccessIntern(user, payload.intern_id);
  const internship = payload.internship_record_id ? await InternshipRecordModel.findById(payload.internship_record_id) : await getActiveInternship(payload.intern_id);
  if (!internship) throw ApiError.badRequest('Internship record is required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const previous = await client.query(`SELECT * FROM attendance WHERE internship_record_id = $1 AND date = $2`, [internship.id, payload.date]);
    const res = await client.query(
      `INSERT INTO attendance (
         organization_id, intern_id, internship_record_id, date, check_in, status, notes,
         verified_by, verification_status, verification_method, source, recorded_at
       )
       VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, NOW()), $6, $7, $8, 'manual', 'supervisor_override', 'supervisor', NOW())
       ON CONFLICT (internship_record_id, date) WHERE internship_record_id IS NOT NULL DO UPDATE SET
         status = EXCLUDED.status, notes = EXCLUDED.notes, verified_by = EXCLUDED.verified_by,
         verification_status = 'manual', verification_method = 'supervisor_override',
         source = 'supervisor', updated_at = NOW()
       RETURNING *`,
      [
        internship.organization_id,
        payload.intern_id,
        internship.id,
        payload.date,
        payload.check_in || null,
        payload.status,
        payload.notes || payload.reason,
        user.id,
      ]
    );
    await client.query(
      `INSERT INTO attendance_audit_logs (organization_id, attendance_id, actor_id, action, previous_value, new_value, reason)
       VALUES ($1, $2, $3, 'manual_correction', $4::jsonb, $5::jsonb, $6)`,
      [internship.organization_id, res.rows[0].id, user.id, JSON.stringify(previous.rows[0] || null), JSON.stringify(res.rows[0]), payload.reason]
    );
    await client.query('COMMIT');
    await notifyOnce({
      userId: payload.intern_id,
      title: 'Attendance updated',
      message: 'A supervisor manually updated one of your attendance records.',
    });
    return res.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function reviewCorrection(user, id, payload) {
  const role = normalizeRole(user);
  if (!['supervisor', 'admin', 'super_admin', 'hr', 'head', 'department_head'].includes(role)) throw ApiError.forbidden('Only supervisors can review corrections');
  const reqRes = await query(`SELECT * FROM attendance_correction_requests WHERE id = $1`, [id]);
  const request = reqRes.rows[0];
  if (!request) throw ApiError.notFound('Correction request not found');
  await assertCanAccessIntern(user, request.intern_id);
  const status = payload.status;
  if (!['approved', 'rejected'].includes(status)) throw ApiError.badRequest('Review status must be approved or rejected');
  const updated = await query(
    `UPDATE attendance_correction_requests
     SET status = $1, reviewer_id = $2, reviewer_reason = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [status, user.id, payload.reason || null, id]
  );
  if (status === 'approved') {
    await manualAttendance(user, {
      intern_id: request.intern_id,
      internship_record_id: request.internship_record_id,
      date: request.date,
      status: request.requested_status || 'present',
      reason: payload.reason || request.reason,
      notes: `Approved correction: ${request.reason}`,
    });
  }
  await notifyOnce({
    userId: request.intern_id,
    title: `Attendance correction ${status}`,
    message: payload.reason || `Your attendance correction request was ${status}.`,
  });
  return updated.rows[0];
}

async function calculateScoreForInternship(internshipRecordId, startDate, endDate) {
  const rows = await query(
    `SELECT status, COUNT(*)::int AS count
     FROM attendance
     WHERE internship_record_id = $1 AND date BETWEEN $2 AND $3
     GROUP BY status`,
    [internshipRecordId, startDate, endDate]
  );
  const counts = rows.rows.reduce((acc, row) => {
    acc[row.status] = Number(row.count);
    return acc;
  }, {});
  const recorded = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const excluded = Object.entries(counts).reduce((sum, [status, count]) => sum + (EXCLUDED_REQUIRED_STATUSES.has(status) ? count : 0), 0);
  const credited = Object.entries(counts).reduce((sum, [status, count]) => sum + (CREDIT_STATUSES.has(status) ? count : 0), 0);
  const required = Math.max(0, recorded - excluded);
  const attendancePercentage = required > 0 ? Number(((credited / required) * 100).toFixed(2)) : 100;
  return {
    required_days: required,
    credited_days: credited,
    attendance_percentage: attendancePercentage,
    present: counts.present || 0,
    late: counts.late || 0,
    absent: counts.absent || 0,
    excused: counts.excused || 0,
    remote: counts.remote || 0,
    public_holiday: counts.public_holiday || 0,
    non_workday: counts.non_workday || 0,
  };
}

async function exportReport(user, filters = {}, format = 'csv') {
  const dashboard = await listSupervisorDashboard(user, filters);
  const rows = dashboard.expected;
  const meta = `Attendance report ${dashboard.date} generated ${new Date().toISOString()}`;
  if (format === 'pdf') {
    const lines = [
      meta,
      `Expected: ${dashboard.counts.expected} Present: ${dashboard.counts.present} Late: ${dashboard.counts.late} Remote: ${dashboard.counts.remote} Excused: ${dashboard.counts.excused}`,
      ...rows.map((r) => `${r.first_name} ${r.last_name} | ${r.department_name || 'Unassigned'} | ${r.status || 'pending'} | ${r.check_in || ''} | ${r.office_name || ''}`),
    ];
    return { contentType: 'application/pdf', filename: `attendance-${dashboard.date}.pdf`, body: makeSimplePdf('Trakive Attendance Report', lines) };
  }
  const header = ['report_meta', 'date', 'intern', 'email', 'department', 'status', 'check_in', 'office', 'verification', 'distance_meters', 'accuracy_meters'];
  const csv = [
    header.join(','),
    ...rows.map((r) => [
      meta,
      dashboard.date,
      `${r.first_name} ${r.last_name}`.trim(),
      r.email,
      r.department_name,
      r.status || 'pending',
      r.check_in,
      r.office_name,
      r.verification_status,
      r.distance_meters,
      r.accuracy_meters,
    ].map(csvEscape).join(',')),
  ].join('\n');
  return { contentType: 'text/csv; charset=utf-8', filename: `attendance-${dashboard.date}.csv`, body: csv };
}

module.exports = {
  getToday,
  checkIn,
  requestCorrection,
  listInternHistory,
  creditRemoteAttendanceFromTask,
  listSupervisorDashboard,
  listConfiguration,
  upsertOffice,
  upsertPolicy,
  createOverride,
  addHoliday,
  manualAttendance,
  reviewCorrection,
  calculateScoreForInternship,
  exportReport,
};
