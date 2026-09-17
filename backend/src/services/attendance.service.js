const AttendanceModel = require('../models/attendance.model');
const AttendanceConfigModel = require('../models/attendanceConfig.model');
const OfficeLocationModel = require('../models/officeLocation.model');
const HolidayModel = require('../models/holiday.model');
const InternshipRecordModel = require('../models/internshipRecord.model');
const ProfileModel = require('../models/profile.model');
const NotificationModel = require('../models/notification.model');
const AuditLogModel = require('../models/auditLog.model');
const { AttendanceCorrectionModel, AttendanceAuditModel } = require('../models/attendanceCorrection.model');
const HolidayService = require('./holiday.service');
const ApiError = require('../utils/apiError');
const { query } = require('../config/db');
const { matchOffice, nearestOffice, isValidCoordinate, isAccuracyReliable } = require('../utils/geo.utils');
const {
  DEFAULT_TZ,
  getZonedDateString,
  parseTimeToMinutes,
  formatMinutes,
  getIsoWeekday,
  minutesNowInZone,
} = require('../utils/timezone.utils');
const { computeAttendanceMetrics, computeOverallScore, normalizeSettings } = require('../utils/attendanceScoring.utils');

const KIND_STATUS = {
  remote: 'remote',
  office_closed: 'non_workday',
  company_event: 'excused',
  training: 'excused',
  excused: 'excused',
  non_working: 'non_workday',
};

function roleName(user) {
  return (user.role_name || '').toLowerCase();
}

function internLink(path = '/dashboard/attendance') {
  return path;
}

async function notifyOnce({ userId, title, message, linkUrl, hours = 20 }) {
  const exists = await NotificationModel.existsSimilar({
    userId,
    type: 'attendance',
    linkUrl,
    createdWithinHours: hours,
  });
  if (exists) return null;
  return NotificationModel.create({
    userId,
    title,
    message,
    type: 'attendance',
    linkUrl,
  });
}

async function getSupervisorUserId(internUserId) {
  const profile = await ProfileModel.findInternProfileByUserId(internUserId);
  if (!profile?.supervisor_id) return null;
  const supervisor = await ProfileModel.findSupervisorById(profile.supervisor_id);
  return supervisor?.user_id || null;
}

const AttendanceService = {
  async assertCanManageIntern(requestingUser, internId) {
    const role = roleName(requestingUser);
    if (role === 'intern') {
      if (requestingUser.id !== internId) {
        throw ApiError.forbidden('Interns can only access their own attendance');
      }
      return ProfileModel.getCompleteInternProfile(internId);
    }
    const profile = await ProfileModel.getCompleteInternProfile(internId);
    if (!profile) throw ApiError.notFound('Intern not found');
    if (role === 'supervisor') {
      const sup = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (!sup || profile.supervisor_id !== sup.id) {
        throw ApiError.forbidden('Supervisors can only manage assigned interns');
      }
    } else if (role === 'head' || role === 'department_head') {
      if (requestingUser.department_id && profile.department_id !== requestingUser.department_id) {
        throw ApiError.forbidden('Department heads can only manage interns in their department');
      }
    }
    return profile;
  },

  async supervisorScopeId(user) {
    if (roleName(user) !== 'supervisor') return null;
    const sup = await ProfileModel.findSupervisorProfileByUserId(user.id);
    return sup?.id || null;
  },

  async resolveInternship(internId, internshipRecordId = null) {
    if (internshipRecordId) {
      const record = await InternshipRecordModel.findById(internshipRecordId);
      if (!record || record.user_id !== internId) {
        throw ApiError.badRequest('Internship record does not belong to this intern');
      }
      return record;
    }
    const active = await InternshipRecordModel.findActiveByUserId(internId);
    if (!active) throw ApiError.unprocessableEntity('No active internship found for attendance');
    return active;
  },

  async resolveDayContext({ internId, organizationId, departmentId, date, timezone, policy }) {
    const tz = timezone || policy?.timezone || DEFAULT_TZ;
    const weekday = getIsoWeekday(date, tz);
    const internOverride = (await AttendanceConfigModel.findOverridesForDate({
      organizationId,
      internId,
      departmentId,
      date,
    })).find((o) => o.scope_type === 'intern');
    const deptOverride = (await AttendanceConfigModel.findOverridesForDate({
      organizationId,
      internId: null,
      departmentId,
      date,
    })).find((o) => o.scope_type === 'department');

    const publicHoliday = await HolidayService.getPublicHoliday(policy.country_code || 'NG', date);
    const orgHoliday = await HolidayModel.findOrgHolidayOnDate(organizationId, date);
    const schedule = departmentId
      ? await AttendanceConfigModel.getDepartmentSchedule(departmentId, organizationId)
      : { weekdays: [2, 3, 4] };
    const weekdays = (schedule.weekdays || [2, 3, 4]).map(Number);
    const arrival = policy.required_arrival_time;
    const grace = Number(policy.grace_minutes || 60);
    const arrivalMinutes = parseTimeToMinutes(arrival);
    const graceUntilMinutes = arrivalMinutes + grace;

    const snapshotBase = {
      timezone: tz,
      weekday,
      required_arrival: formatMinutes(arrivalMinutes),
      grace_minutes: grace,
      grace_until: formatMinutes(graceUntilMinutes),
      department_weekdays: weekdays,
    };

    if (internOverride) {
      return this._contextFromOverride(internOverride, snapshotBase, 'individual_override');
    }
    if (deptOverride) {
      return this._contextFromOverride(deptOverride, snapshotBase, 'department_override', weekday);
    }
    if (publicHoliday) {
      return {
        required: false,
        derived_status: 'public_holiday',
        kind: 'public_holiday',
        label: publicHoliday.english_name || publicHoliday.local_name,
        snapshot: { ...snapshotBase, required: false, kind: 'public_holiday', source: 'public_holiday' },
      };
    }
    if (orgHoliday) {
      const status = orgHoliday.kind === 'org_holiday' ? 'public_holiday' : (KIND_STATUS[orgHoliday.kind] || 'non_workday');
      return {
        required: false,
        derived_status: status,
        kind: orgHoliday.kind,
        label: orgHoliday.name,
        snapshot: { ...snapshotBase, required: false, kind: orgHoliday.kind, source: 'organization_holiday' },
      };
    }

    const required = weekdays.includes(weekday);
    return {
      required,
      derived_status: required ? null : 'non_workday',
      kind: required ? 'scheduled' : 'non_workday',
      label: required ? 'Required attendance day' : 'Not a scheduled attendance day',
      snapshot: {
        ...snapshotBase,
        required,
        kind: required ? 'scheduled' : 'non_workday',
        source: 'department_schedule',
      },
    };
  },

  _contextFromOverride(override, snapshotBase, source, weekday = null) {
    if (override.kind === 'schedule' || override.kind === 'required') {
      const days = (override.weekdays || []).map(Number);
      const required = override.kind === 'required'
        ? true
        : (days.length ? days.includes(weekday) : true);
      return {
        required,
        derived_status: required ? null : 'non_workday',
        kind: 'schedule',
        label: override.reason,
        snapshot: { ...snapshotBase, required, kind: 'schedule', source, override_id: override.id },
      };
    }
    const status = KIND_STATUS[override.kind] || 'excused';
    const required = override.kind === 'remote';
    return {
      required,
      derived_status: status,
      kind: override.kind,
      label: override.reason,
      snapshot: { ...snapshotBase, required, kind: override.kind, source, override_id: override.id },
    };
  },

  classifyArrival(checkInDate, policy, timezone) {
    const minutes = minutesNowInZone(checkInDate, timezone);
    const arrival = parseTimeToMinutes(policy.required_arrival_time);
    const graceUntil = arrival + Number(policy.grace_minutes || 60);
    if (minutes <= graceUntil) return 'present';
    return 'late';
  },

  graceWindowPassed(date, policy, timezone, now = new Date()) {
    const today = getZonedDateString(now, timezone);
    if (date < today) return true;
    if (date > today) return false;
    const minutes = minutesNowInZone(now, timezone);
    const arrival = parseTimeToMinutes(policy.required_arrival_time);
    return minutes > arrival + Number(policy.grace_minutes || 60);
  },

  async getToday(user, { internship_record_id } = {}) {
    if (roleName(user) !== 'intern') {
      throw ApiError.forbidden('Only interns have a personal attendance check-in');
    }
    const internProfile = await ProfileModel.findInternProfileByUserId(user.id);
    const organizationId = user.organization_id || internProfile?.organization_id;
    if (!organizationId) throw ApiError.unprocessableEntity('Intern is not assigned to an organization');

    const internship = await this.resolveInternship(user.id, internship_record_id);
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const timezone = policy.timezone || DEFAULT_TZ;
    const date = getZonedDateString(new Date(), timezone);
    const departmentId = internProfile?.department_id || internship.department_id || user.department_id;
    const context = await this.resolveDayContext({
      internId: user.id,
      organizationId,
      departmentId,
      date,
      timezone,
      policy,
    });
    const pendingRequest = await AttendanceCorrectionModel.findPendingForInternDate(user.id, date);
    let record = await AttendanceModel.findByInternAndDate(user.id, date);
    if (!record && context.derived_status === 'remote') {
      record = await this._persistRecord({
        organizationId,
        internId: user.id,
        internship,
        date,
        status: 'remote',
        source: 'system',
        verificationStatus: 'verified',
        snapshot: context.snapshot,
        notes: context.label,
      });
    }
    const offices = await OfficeLocationModel.listByOrganization(organizationId);
    const checkedIn = Boolean(record && record.check_in);
    const autoStatus = !context.required ? context.derived_status : null;

    return {
      date,
      timezone,
      internship_record_id: internship.id,
      internship_title: internship.title,
      required: context.required,
      kind: context.kind,
      label: context.label,
      derived_status: record?.status || autoStatus,
      scheduled_arrival: context.snapshot.required_arrival,
      grace_until: context.snapshot.grace_until,
      grace_passed: this.graceWindowPassed(date, policy, timezone),
      already_checked_in: checkedIn,
      can_check_in: context.required && !checkedIn && !['remote', 'excused', 'public_holiday', 'non_workday'].includes(record?.status),
      record,
      pending_correction: pendingRequest,
      offices: offices.map((o) => ({ id: o.id, name: o.name, address: o.address, radius_m: o.radius_m })),
      policy: {
        required_arrival_time: policy.required_arrival_time,
        grace_minutes: policy.grace_minutes,
        max_accuracy_m: policy.max_accuracy_m,
      },
    };
  },

  async checkIn(user, payload = {}, meta = {}) {
    if (roleName(user) !== 'intern') {
      throw ApiError.forbidden('Only interns can check in');
    }
    const internProfile = await ProfileModel.findInternProfileByUserId(user.id);
    const organizationId = user.organization_id || internProfile?.organization_id;
    if (!organizationId) throw ApiError.unprocessableEntity('Intern is not assigned to an organization');

    const internship = await this.resolveInternship(user.id, payload.internship_record_id);
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const timezone = policy.timezone || DEFAULT_TZ;
    const now = new Date();
    const date = getZonedDateString(now, timezone);
    const departmentId = internProfile?.department_id || internship.department_id || user.department_id;
    const context = await this.resolveDayContext({
      internId: user.id,
      organizationId,
      departmentId,
      date,
      timezone,
      policy,
    });

    const existing = await AttendanceModel.findByInternAndDate(user.id, date);
    if (existing && existing.check_in) {
      throw ApiError.conflict('Already checked in for today', { code: 'ALREADY_CHECKED_IN', record: existing });
    }
    if (existing && ['remote', 'excused', 'public_holiday', 'non_workday'].includes(existing.status)) {
      throw ApiError.conflict('Attendance for today is already recorded', { code: 'ALREADY_RECORDED', record: existing });
    }
    if (!context.required) {
      throw ApiError.unprocessableEntity(context.label || 'Attendance is not required today', {
        code: 'NOT_REQUIRED',
        kind: context.kind,
      });
    }
    if (context.derived_status === 'remote') {
      const remoteRecord = await this._persistRecord({
        organizationId,
        internId: user.id,
        internship,
        date,
        status: 'remote',
        source: 'system',
        verificationStatus: 'verified',
        snapshot: context.snapshot,
        notes: context.label,
        existing,
      });
      return remoteRecord;
    }

    const lat = payload.latitude;
    const lng = payload.longitude;
    if (!isValidCoordinate(lat, lng)) {
      throw ApiError.unprocessableEntity('A valid location is required to check in', { code: 'LOCATION_UNAVAILABLE' });
    }

    const offices = await OfficeLocationModel.listByOrganization(organizationId);
    if (!offices.length) {
      throw ApiError.unprocessableEntity('No office locations are configured', { code: 'NO_OFFICES' });
    }

    const flags = [];
    const accuracy = payload.accuracy == null ? null : Number(payload.accuracy);
    const matched = matchOffice(lat, lng, offices);
    const nearest = nearestOffice(lat, lng, offices);
    const radius = matched?.radius_m || nearest?.radius_m || policy.default_radius_m || 200;
    const accuracyCheck = isAccuracyReliable(accuracy, radius, policy.max_accuracy_m);
    if (!accuracyCheck.reliable) {
      flags.push(accuracyCheck.reason);
      throw ApiError.unprocessableEntity(
        'GPS accuracy is too low to verify you are inside the office geofence',
        { code: 'LOCATION_INACCURATE', flags, accuracy, radius_m: radius, nearest_office: nearest?.office?.name || null, distance_m: nearest ? Math.round(nearest.distance_m) : null }
      );
    }
    if (!matched) {
      flags.push('outside_geofence');
      throw ApiError.unprocessableEntity(
        'You are outside all configured office locations',
        { code: 'OUTSIDE_GEOFENCE', nearest_office: nearest?.office?.name || null, distance_m: nearest ? Math.round(nearest.distance_m) : null, radius_m: nearest?.radius_m || radius }
      );
    }

    const recent = await AttendanceModel.listRecentForIntern(user.id, 5);
    const identical = recent.some((r) => Number(r.check_in_lat) === Number(lat) && Number(r.check_in_lng) === Number(lng));
    if (identical) flags.push('repeated_identical_coordinates');
    if (accuracy != null && accuracy > 80) flags.push('coarse_accuracy');

    const status = this.classifyArrival(now, policy, timezone);
    const isSuspicious = flags.length > 0;
    const record = await this._persistRecord({
      organizationId,
      internId: user.id,
      internship,
      date,
      status,
      source: payload.manual ? 'manual' : 'geofence',
      verificationStatus: isSuspicious ? 'flagged' : 'verified',
      snapshot: context.snapshot,
      existing,
      extra: {
        check_in: now.toISOString(),
        office_location_id: matched.office.id,
        check_in_lat: lat,
        check_in_lng: lng,
        location_accuracy_m: accuracy,
        distance_m: Number(matched.distance_m.toFixed(2)),
        verification_flags: flags,
        is_suspicious: isSuspicious,
        client_meta: {
          user_agent: meta.userAgent || null,
          auto: payload.auto === true,
        },
      },
    });

    await AttendanceAuditModel.log({
      organizationId,
      attendanceId: record.id,
      internId: user.id,
      internshipRecordId: internship.id,
      actorId: user.id,
      action: 'CHECK_IN',
      previousValue: existing,
      newValue: { status: record.status, check_in: record.check_in, office_location_id: record.office_location_id },
      reason: payload.manual ? 'Manual check-in' : 'Automatic check-in',
    });

    if (status === 'late') {
      await notifyOnce({
        userId: user.id,
        title: 'Late check-in recorded',
        message: `You checked in after the ${formatMinutes(parseTimeToMinutes(policy.required_arrival_time) + Number(policy.grace_minutes))} grace window.`,
        linkUrl: internLink(),
      });
      const supervisorUserId = await getSupervisorUserId(user.id);
      if (supervisorUserId) {
        await notifyOnce({
          userId: supervisorUserId,
          title: 'Intern checked in late',
          message: `${user.first_name || 'An intern'} checked in late today.`,
          linkUrl: '/supervisor/attendance',
          hours: 12,
        });
      }
    }

    return record;
  },

  async _persistRecord({
    organizationId, internId, internship, date, status, source,
    verificationStatus, snapshot, notes, existing, extra = {},
  }) {
    if (existing) {
      return AttendanceModel.update(existing.id, {
        status,
        source,
        verification_status: verificationStatus,
        schedule_snapshot: snapshot,
        notes: notes || existing.notes,
        internship_record_id: internship.id,
        ...extra,
      });
    }
    try {
      return await AttendanceModel.insert({
        organization_id: organizationId,
        intern_id: internId,
        internship_record_id: internship.id,
        date,
        status,
        source,
        verification_status: verificationStatus,
        schedule_snapshot: snapshot,
        notes,
        ...extra,
      });
    } catch (err) {
      if (err.code === '23505') {
        const again = await AttendanceModel.findByInternAndDate(internId, date);
        throw ApiError.conflict('Already checked in for today', { code: 'ALREADY_CHECKED_IN', record: again });
      }
      throw err;
    }
  },

  async requestCorrection(user, payload = {}) {
    if (roleName(user) !== 'intern') throw ApiError.forbidden('Only interns can request attendance review');
    const internProfile = await ProfileModel.findInternProfileByUserId(user.id);
    const organizationId = user.organization_id || internProfile?.organization_id;
    const internship = await this.resolveInternship(user.id, payload.internship_record_id);
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const date = payload.date || getZonedDateString(new Date(), policy.timezone || DEFAULT_TZ);
    if (!payload.reason || String(payload.reason).trim().length < 8) {
      throw ApiError.unprocessableEntity('Please provide a reason (at least 8 characters)');
    }
    const existingPending = await AttendanceCorrectionModel.findPendingForInternDate(user.id, date);
    if (existingPending) {
      throw ApiError.conflict('A review request is already pending for this date', { code: 'REQUEST_EXISTS' });
    }
    const attendance = await AttendanceModel.findByInternAndDate(user.id, date);
    const request = await AttendanceCorrectionModel.create({
      organization_id: organizationId,
      intern_id: user.id,
      internship_record_id: internship.id,
      attendance_id: attendance?.id || null,
      request_date: date,
      reason: payload.reason.trim(),
      location_state: payload.location_state || null,
      client_lat: payload.latitude || null,
      client_lng: payload.longitude || null,
      client_accuracy_m: payload.accuracy ?? null,
    });

    if (attendance) {
      await AttendanceModel.update(attendance.id, { status: 'pending_review' });
    } else {
      await AttendanceModel.insert({
        organization_id: organizationId,
        intern_id: user.id,
        internship_record_id: internship.id,
        date,
        status: 'pending_review',
        source: 'correction',
        verification_status: 'pending',
        schedule_snapshot: { required: true, kind: 'pending_review', source: 'intern_request' },
        notes: payload.reason.trim(),
      });
    }

    const supervisorUserId = await getSupervisorUserId(user.id);
    if (supervisorUserId) {
      await notifyOnce({
        userId: supervisorUserId,
        title: 'Attendance review requested',
        message: `${user.first_name || 'An intern'} requested attendance review for ${date}.`,
        linkUrl: '/supervisor/attendance',
        hours: 6,
      });
    }
    return request;
  },

  async getInternHistory(user, queryParams = {}) {
    const internId = queryParams.intern_id || user.id;
    await this.assertCanManageIntern(user, internId);
    const internship = await this.resolveInternship(internId, queryParams.internship_record_id);
    const month = queryParams.month || getZonedDateString(new Date()).slice(0, 7);
    const [year, mo] = month.split('-').map(Number);
    const startDate = `${month}-01`;
    const lastDay = new Date(Date.UTC(year, mo, 0)).getUTCDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const internProfile = await ProfileModel.findInternProfileByUserId(internId);
    const organizationId = internProfile?.organization_id || internship.organization_id;
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const records = await AttendanceModel.findPaginated({
      intern_id: internId,
      internship_record_id: internship.id,
      start_date: internship.start_date,
      end_date: internship.end_date,
      limit: 500,
      offset: 0,
      sort: 'date:asc',
    });
    const settings = await AttendanceConfigModel.getPerformanceSettings(organizationId);
    const metrics = computeAttendanceMetrics(records, settings);
    const monthRecords = records.filter((r) => String(r.date).slice(0, 7) === month);

    const days = [];
    for (let d = 1; d <= lastDay; d += 1) {
      const date = `${month}-${String(d).padStart(2, '0')}`;
      const record = records.find((r) => String(r.date).slice(0, 10) === date);
      let context = null;
      if (!record) {
        context = await this.resolveDayContext({
          internId,
          organizationId,
          departmentId: internProfile?.department_id || internship.department_id,
          date,
          timezone: policy.timezone,
          policy,
        });
      }
      days.push({
        date,
        record: record || null,
        required: record ? Boolean(record.schedule_snapshot?.required ?? true) : context.required,
        status: record?.status || (date > getZonedDateString(new Date(), policy.timezone)
          ? (context.required ? 'upcoming' : context.derived_status)
          : (this.graceWindowPassed(date, policy, policy.timezone)
            ? (context.required ? 'absent_pending' : context.derived_status)
            : (context.required ? 'awaiting' : context.derived_status))),
        kind: record?.schedule_snapshot?.kind || context?.kind,
      });
    }

    const corrections = await AttendanceCorrectionModel.list({
      organizationId,
      internId,
      limit: 50,
      offset: 0,
    });

    return {
      internship: {
        id: internship.id,
        title: internship.title,
        internship_number: internship.internship_number,
        start_date: internship.start_date,
        end_date: internship.end_date,
      },
      month,
      range: { startDate, endDate },
      metrics,
      month_metrics: computeAttendanceMetrics(monthRecords, settings),
      days,
      records,
      corrections,
    };
  },

  async getInternSummary(user, internId, internshipRecordId) {
    const target = internId || user.id;
    await this.assertCanManageIntern(user, target);
    const internship = await this.resolveInternship(target, internshipRecordId);
    const internProfile = await ProfileModel.findInternProfileByUserId(target);
    const organizationId = internProfile?.organization_id || internship.organization_id;
    const records = await AttendanceModel.findByInternship(internship.id);
    const settings = await AttendanceConfigModel.getPerformanceSettings(organizationId);
    return {
      internship_record_id: internship.id,
      internship_title: internship.title,
      ...computeAttendanceMetrics(records, settings),
    };
  },

  async supervisorDashboard(user, filters = {}) {
    const organizationId = user.organization_id;
    if (!organizationId) throw ApiError.unprocessableEntity('User is not assigned to an organization');
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const timezone = policy.timezone || DEFAULT_TZ;
    const date = filters.date || getZonedDateString(new Date(), timezone);
    const supervisorProfileId = await this.supervisorScopeId(user);

    const internSql = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.department_id,
             d.name AS department_name, ip.supervisor_id,
             ir.id AS internship_record_id, ir.title AS internship_title
      FROM users u
      JOIN intern_profiles ip ON ip.user_id = u.id
      LEFT JOIN departments d ON d.id = COALESCE(ip.department_id, u.department_id)
      LEFT JOIN internship_records ir ON ir.user_id = u.id AND ir.status IN ('active','onboarding')
      WHERE u.deleted_at IS NULL AND u.organization_id = $1
        AND ($2::uuid IS NULL OR ip.supervisor_id = $2)
        AND ($3::uuid IS NULL OR COALESCE(ip.department_id, u.department_id) = $3)
        AND ($4::uuid IS NULL OR u.id = $4)
    `;
    const internRes = await query(internSql, [
      organizationId,
      supervisorProfileId,
      filters.department_id || null,
      filters.intern_id || null,
    ]);

    const expected = [];
    const counts = {
      expected: 0, present: 0, late: 0, absent: 0, remote: 0, excused: 0, pending: 0, not_required: 0,
    };

    for (const intern of internRes.rows) {
      const context = await this.resolveDayContext({
        internId: intern.id,
        organizationId,
        departmentId: intern.department_id,
        date,
        timezone,
        policy,
      });
      const record = await AttendanceModel.findByInternAndDate(intern.id, date);
      let status = record?.status;
      if (!status) {
        if (!context.required) status = context.derived_status;
        else if (this.graceWindowPassed(date, policy, timezone)) status = 'absent';
        else status = 'awaiting';
      }
      const row = {
        intern_id: intern.id,
        name: `${intern.first_name} ${intern.last_name}`.trim(),
        email: intern.email,
        department_id: intern.department_id,
        department_name: intern.department_name,
        internship_record_id: intern.internship_record_id,
        internship_title: intern.internship_title,
        required: context.required,
        status,
        check_in: record?.check_in || null,
        office_name: record?.office_name || null,
        is_suspicious: record?.is_suspicious || false,
        record_id: record?.id || null,
      };
      if (context.required || ['present', 'late', 'absent', 'remote', 'pending_review'].includes(status)) {
        expected.push(row);
        counts.expected += context.required ? 1 : 0;
      } else {
        counts.not_required += 1;
      }
      if (status === 'present') counts.present += 1;
      if (status === 'late') counts.late += 1;
      if (status === 'absent') counts.absent += 1;
      if (status === 'remote') counts.remote += 1;
      if (status === 'excused') counts.excused += 1;
      if (status === 'pending_review' || status === 'pending_correction') counts.pending += 1;
    }

    const listFilters = {
      organization_id: organizationId,
      supervisor_profile_id: supervisorProfileId,
      intern_id: filters.intern_id || null,
      department_id: filters.department_id || null,
      internship_record_id: filters.internship_record_id || null,
      office_location_id: filters.office_id || null,
      status: filters.status || null,
      start_date: filters.start_date || date,
      end_date: filters.end_date || date,
      month: filters.month || null,
      search: filters.search || '',
      suspicious: filters.suspicious,
      limit: Number(filters.limit) || 100,
      offset: ((Number(filters.page) || 1) - 1) * (Number(filters.limit) || 100),
      sort: filters.sort || 'date:desc',
    };
    const records = await AttendanceModel.findPaginated(listFilters);
    const total = await AttendanceModel.count(listFilters);
    const corrections = await AttendanceCorrectionModel.list({
      organizationId,
      internId: filters.intern_id || null,
      status: filters.correction_status || 'pending',
      supervisorProfileId,
      limit: 50,
      offset: 0,
    });
    const suspicious = await AttendanceModel.findPaginated({
      organization_id: organizationId,
      supervisor_profile_id: supervisorProfileId,
      suspicious: true,
      start_date: filters.start_date || date,
      end_date: filters.end_date || date,
      limit: 50,
      offset: 0,
    });

    return {
      date,
      timezone,
      counts,
      expected_interns: expected,
      records,
      pagination: { page: Number(filters.page) || 1, limit: listFilters.limit, totalItems: total },
      corrections,
      suspicious,
    };
  },

  async listRecords(user, filters) {
    if (roleName(user) === 'intern') {
      return AttendanceModel.findPaginated({
        intern_id: user.id,
        internship_record_id: filters.internship_record_id,
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status,
        month: filters.month,
        limit: Number(filters.limit) || 50,
        offset: ((Number(filters.page) || 1) - 1) * (Number(filters.limit) || 50),
      });
    }
    const supervisorProfileId = await this.supervisorScopeId(user);
    return AttendanceModel.findPaginated({
      organization_id: user.organization_id,
      supervisor_profile_id: supervisorProfileId,
      intern_id: filters.intern_id,
      department_id: roleName(user) === 'head' || roleName(user) === 'department_head'
        ? (user.department_id || filters.department_id)
        : filters.department_id,
      internship_record_id: filters.internship_record_id,
      office_location_id: filters.office_id,
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
      month: filters.month,
      search: filters.search,
      suspicious: filters.suspicious,
      limit: Number(filters.limit) || 50,
      offset: ((Number(filters.page) || 1) - 1) * (Number(filters.limit) || 50),
    });
  },

  async manualUpsert(user, payload, meta = {}) {
    const internId = payload.intern_id;
    const internProfile = await this.assertCanManageIntern(user, internId);
    if (!payload.reason || String(payload.reason).trim().length < 5) {
      throw ApiError.unprocessableEntity('A reason is required for manual attendance changes');
    }
    const internship = await this.resolveInternship(internId, payload.internship_record_id);
    const organizationId = internProfile.organization_id || user.organization_id;
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const date = payload.date;
    const existing = await AttendanceModel.findByInternAndDate(internId, date);
    const allowed = ['present', 'late', 'absent', 'excused', 'remote', 'public_holiday', 'non_workday'];
    if (!allowed.includes(payload.status)) {
      throw ApiError.unprocessableEntity('Invalid attendance status');
    }
    const snapshot = existing?.schedule_snapshot || {
      required: !['public_holiday', 'non_workday', 'excused'].includes(payload.status),
      kind: 'manual_correction',
      source: 'supervisor',
      timezone: policy.timezone,
    };
    const next = existing
      ? await AttendanceModel.update(existing.id, {
        status: payload.status,
        notes: payload.notes || payload.reason,
        source: 'supervisor',
        verification_status: 'verified',
        verified_by: user.id,
        correction_reason: payload.reason,
        schedule_snapshot: snapshot,
        internship_record_id: internship.id,
        check_in: payload.status === 'present' || payload.status === 'late'
          ? (existing.check_in || new Date().toISOString())
          : existing.check_in,
      })
      : await AttendanceModel.insert({
        organization_id: organizationId,
        intern_id: internId,
        internship_record_id: internship.id,
        date,
        status: payload.status,
        notes: payload.notes || payload.reason,
        source: 'supervisor',
        verification_status: 'verified',
        verified_by: user.id,
        correction_reason: payload.reason,
        schedule_snapshot: snapshot,
        check_in: ['present', 'late'].includes(payload.status) ? new Date().toISOString() : null,
      });

    await AttendanceAuditModel.log({
      organizationId,
      attendanceId: next.id,
      internId,
      internshipRecordId: internship.id,
      actorId: user.id,
      action: existing ? 'MANUAL_CORRECTION' : 'MANUAL_CREATE',
      previousValue: existing,
      newValue: { status: next.status },
      reason: payload.reason,
    });
    await AuditLogModel.log({
      organizationId,
      userId: user.id,
      action: 'ATTENDANCE_MANUAL_CHANGE',
      entityType: 'attendance',
      entityId: next.id,
      details: { intern_id: internId, date, previous: existing?.status || null, next: next.status, reason: payload.reason },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
    await notifyOnce({
      userId: internId,
      title: 'Attendance updated by supervisor',
      message: `Your attendance for ${date} was set to ${payload.status}. Reason: ${payload.reason}`,
      linkUrl: internLink(),
      hours: 2,
    });
    return next;
  },

  async reviewCorrection(user, requestId, payload, meta = {}) {
    const request = await AttendanceCorrectionModel.findById(requestId);
    if (!request) throw ApiError.notFound('Correction request not found');
    await this.assertCanManageIntern(user, request.intern_id);
    if (request.status !== 'pending') throw ApiError.conflict('Request already reviewed');
    const status = payload.status;
    if (!['approved', 'rejected'].includes(status)) {
      throw ApiError.unprocessableEntity('status must be approved or rejected');
    }
    const reviewed = await AttendanceCorrectionModel.review(requestId, {
      status,
      reviewerId: user.id,
      reviewerNotes: payload.reviewer_notes,
    });
    if (status === 'approved') {
      await this.manualUpsert(user, {
        intern_id: request.intern_id,
        internship_record_id: request.internship_record_id,
        date: request.request_date,
        status: payload.attendance_status || 'excused',
        reason: payload.reviewer_notes || `Approved correction: ${request.reason}`,
      }, meta);
    } else {
      const attendance = await AttendanceModel.findByInternAndDate(request.intern_id, request.request_date);
      if (attendance && attendance.status === 'pending_review') {
        const policy = await AttendanceConfigModel.getPolicy(request.organization_id);
        const markAbsent = this.graceWindowPassed(request.request_date, policy, policy.timezone);
        await AttendanceModel.update(attendance.id, { status: markAbsent ? 'absent' : 'pending_correction' });
      }
      await notifyOnce({
        userId: request.intern_id,
        title: 'Attendance review rejected',
        message: payload.reviewer_notes || 'Your attendance review request was rejected.',
        linkUrl: internLink(),
        hours: 2,
      });
    }
    if (status === 'approved') {
      await notifyOnce({
        userId: request.intern_id,
        title: 'Attendance review approved',
        message: `Your attendance for ${request.request_date} was approved.`,
        linkUrl: internLink(),
        hours: 2,
      });
    }
    return reviewed;
  },

  async listOffices(user) {
    if (!user.organization_id) throw ApiError.unprocessableEntity('No organization');
    return OfficeLocationModel.listByOrganization(user.organization_id, { includeInactive: true });
  },

  async saveOffice(user, payload, id = null) {
    if (!user.organization_id) throw ApiError.unprocessableEntity('No organization');
    if (id) {
      const existing = await OfficeLocationModel.findById(id);
      if (!existing || existing.organization_id !== user.organization_id) throw ApiError.notFound('Office not found');
      return OfficeLocationModel.update(id, payload);
    }
    return OfficeLocationModel.create({ ...payload, organization_id: user.organization_id, created_by: user.id });
  },

  async deleteOffice(user, id) {
    const existing = await OfficeLocationModel.findById(id);
    if (!existing || existing.organization_id !== user.organization_id) throw ApiError.notFound('Office not found');
    return OfficeLocationModel.softDelete(id);
  },

  async getConfig(user) {
    const organizationId = user.organization_id;
    const policy = await AttendanceConfigModel.getPolicy(organizationId);
    const schedules = await AttendanceConfigModel.listDepartmentSchedules(organizationId);
    const settings = await AttendanceConfigModel.getPerformanceSettings(organizationId);
    const offices = await OfficeLocationModel.listByOrganization(organizationId, { includeInactive: true });
    const today = getZonedDateString(new Date(), policy.timezone);
    const yearStart = `${today.slice(0, 4)}-01-01`;
    const yearEnd = `${today.slice(0, 4)}-12-31`;
    const holidays = await HolidayService.listRange(policy.country_code, organizationId, yearStart, yearEnd);
    const overrides = await AttendanceConfigModel.listOverrides({ organizationId });
    return { policy, schedules, settings, offices, holidays, overrides };
  },

  async updatePolicy(user, payload) {
    return AttendanceConfigModel.upsertPolicy(user.organization_id, payload);
  },

  async updateDepartmentSchedule(user, departmentId, weekdays) {
    if (roleName(user) === 'head' || roleName(user) === 'department_head') {
      if (user.department_id && user.department_id !== departmentId) {
        throw ApiError.forbidden('You can only edit your department schedule');
      }
    }
    if (!Array.isArray(weekdays) || !weekdays.length) {
      throw ApiError.unprocessableEntity('Select at least one weekday');
    }
    const normalized = [...new Set(weekdays.map(Number))].filter((d) => d >= 1 && d <= 7);
    const updated = await AttendanceConfigModel.upsertDepartmentSchedule({
      organizationId: user.organization_id,
      departmentId,
      weekdays: normalized,
      createdBy: user.id,
    });
    await this._notifyDepartmentScheduleChange(user, departmentId);
    return updated;
  },

  async _notifyDepartmentScheduleChange(user, departmentId) {
    const res = await query(
      `SELECT u.id FROM users u
       JOIN intern_profiles ip ON ip.user_id = u.id
       WHERE COALESCE(ip.department_id, u.department_id) = $1 AND u.deleted_at IS NULL`,
      [departmentId]
    );
    for (const intern of res.rows) {
      await notifyOnce({
        userId: intern.id,
        title: 'Attendance schedule updated',
        message: 'Your department attendance days were updated. Check Attendance for details.',
        linkUrl: internLink(),
        hours: 12,
      });
    }
  },

  async createOverride(user, payload) {
    if (!payload.reason || String(payload.reason).trim().length < 5) {
      throw ApiError.unprocessableEntity('A reason is required for schedule overrides');
    }
    if (payload.scope_type === 'intern') {
      await this.assertCanManageIntern(user, payload.intern_id);
    }
    const created = await AttendanceConfigModel.createOverride({
      organization_id: user.organization_id,
      scope_type: payload.scope_type,
      department_id: payload.department_id,
      intern_id: payload.intern_id,
      start_date: payload.start_date,
      end_date: payload.end_date || payload.start_date,
      weekdays: payload.weekdays || null,
      kind: payload.kind,
      reason: payload.reason.trim(),
      created_by: user.id,
    });
    if (payload.scope_type === 'intern' && payload.intern_id) {
      await notifyOnce({
        userId: payload.intern_id,
        title: 'Attendance exception added',
        message: `A schedule change applies from ${created.start_date} to ${created.end_date}: ${created.kind}.`,
        linkUrl: internLink(),
        hours: 6,
      });
    } else if (payload.department_id) {
      await this._notifyDepartmentScheduleChange(user, payload.department_id);
    }
    return created;
  },

  async deleteOverride(user, id) {
    const deleted = await AttendanceConfigModel.deleteOverride(id, user.organization_id);
    if (!deleted) throw ApiError.notFound('Override not found');
    return deleted;
  },

  async createOrgHoliday(user, payload) {
    return HolidayModel.createOrgHoliday({
      organization_id: user.organization_id,
      holiday_date: payload.holiday_date,
      name: payload.name,
      kind: payload.kind || 'org_holiday',
      is_recurring: payload.is_recurring,
      notes: payload.notes,
      created_by: user.id,
    });
  },

  async deleteOrgHoliday(user, id) {
    const deleted = await HolidayModel.deleteOrgHoliday(id, user.organization_id);
    if (!deleted) throw ApiError.notFound('Holiday not found');
    return deleted;
  },

  async updatePerformanceSettings(user, payload) {
    return AttendanceConfigModel.upsertPerformanceSettings(user.organization_id, payload, user.id);
  },

  async exportRecords(user, filters, format = 'csv') {
    const supervisorProfileId = roleName(user) === 'intern' ? null : await this.supervisorScopeId(user);
    const internId = roleName(user) === 'intern' ? user.id : filters.intern_id;
    const rows = await AttendanceModel.findPaginated({
      organization_id: user.organization_id,
      supervisor_profile_id: supervisorProfileId,
      intern_id: internId,
      department_id: filters.department_id,
      internship_record_id: filters.internship_record_id,
      office_location_id: filters.office_id,
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
      month: filters.month,
      search: filters.search,
      limit: 5000,
      offset: 0,
      sort: 'date:asc',
    });
    const generatedAt = new Date().toISOString();
    const meta = {
      generatedAt,
      generatedBy: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      organizationId: user.organization_id,
      filters,
      rowCount: rows.length,
    };
    if (format === 'pdf') {
      return { contentType: 'application/pdf', filename: `attendance-${filters.start_date || 'export'}.pdf`, body: buildPdf(meta, rows) };
    }
    return { contentType: 'text/csv; charset=utf-8', filename: `attendance-${filters.start_date || 'export'}.csv`, body: buildCsv(meta, rows) };
  },

  async runCloseWindowJob() {
    const orgs = await query('SELECT id FROM organizations WHERE deleted_at IS NULL');
    let marked = 0;
    let notified = 0;
    for (const org of orgs.rows) {
      const policy = await AttendanceConfigModel.getPolicy(org.id);
      const timezone = policy.timezone || DEFAULT_TZ;
      const date = getZonedDateString(new Date(), timezone);
      if (!this.graceWindowPassed(date, policy, timezone)) continue;
      const internRes = await query(
        `SELECT u.id, u.first_name, ip.department_id, ip.organization_id, ir.id AS internship_record_id
         FROM users u
         JOIN intern_profiles ip ON ip.user_id = u.id
         LEFT JOIN internship_records ir ON ir.user_id = u.id AND ir.status IN ('active','onboarding')
         WHERE u.deleted_at IS NULL AND u.organization_id = $1`,
        [org.id]
      );
      for (const intern of internRes.rows) {
        const existing = await AttendanceModel.findByInternAndDate(intern.id, date);
        if (existing) {
          if (existing.status === 'late') {
            const sent = await notifyOnce({
              userId: intern.id,
              title: 'You were marked late',
              message: 'Your check-in today was after the grace period.',
              linkUrl: internLink(),
            });
            if (sent) notified += 1;
          }
          continue;
        }
        const internship = intern.internship_record_id
          ? await InternshipRecordModel.findById(intern.internship_record_id)
          : await InternshipRecordModel.findActiveByUserId(intern.id);
        if (!internship) continue;
        const context = await this.resolveDayContext({
          internId: intern.id,
          organizationId: org.id,
          departmentId: intern.department_id,
          date,
          timezone,
          policy,
        });
        if (!context.required) continue;
        if (context.derived_status && context.derived_status !== null && context.kind !== 'scheduled') {
          await AttendanceModel.insert({
            organization_id: org.id,
            intern_id: intern.id,
            internship_record_id: internship.id,
            date,
            status: context.derived_status,
            source: 'system',
            verification_status: 'verified',
            schedule_snapshot: context.snapshot,
            notes: context.label,
          });
          marked += 1;
          continue;
        }
        await AttendanceModel.insert({
          organization_id: org.id,
          intern_id: intern.id,
          internship_record_id: internship.id,
          date,
          status: 'absent',
          source: 'system',
          verification_status: 'verified',
          schedule_snapshot: context.snapshot,
        });
        marked += 1;
        const sent = await notifyOnce({
          userId: intern.id,
          title: 'Missed attendance',
          message: `You were marked absent for ${date} because no verified check-in was received.`,
          linkUrl: internLink(),
        });
        if (sent) notified += 1;
        const supervisorUserId = await getSupervisorUserId(intern.id);
        if (supervisorUserId) {
          await notifyOnce({
            userId: supervisorUserId,
            title: 'Intern absence recorded',
            message: `${intern.first_name || 'An intern'} was marked absent today.`,
            linkUrl: '/supervisor/attendance',
            hours: 12,
          });
        }
      }
    }
    return { marked, notified };
  },

  async runUpcomingReminders() {
    const orgs = await query('SELECT id FROM organizations WHERE deleted_at IS NULL');
    let sentCount = 0;
    for (const org of orgs.rows) {
      const policy = await AttendanceConfigModel.getPolicy(org.id);
      const timezone = policy.timezone || DEFAULT_TZ;
      const date = getZonedDateString(new Date(), timezone);
      const minutes = minutesNowInZone(new Date(), timezone);
      if (minutes > 7 * 60 + 30) continue;
      const internRes = await query(
        `SELECT u.id, u.first_name, ip.department_id FROM users u
         JOIN intern_profiles ip ON ip.user_id = u.id
         WHERE u.deleted_at IS NULL AND u.organization_id = $1`,
        [org.id]
      );
      for (const intern of internRes.rows) {
        const context = await this.resolveDayContext({
          internId: intern.id,
          organizationId: org.id,
          departmentId: intern.department_id,
          date,
          timezone,
          policy,
        });
        if (!context.required) continue;
        const existing = await AttendanceModel.findByInternAndDate(intern.id, date);
        if (existing?.check_in) continue;
        const sent = await notifyOnce({
          userId: intern.id,
          title: 'Attendance required today',
          message: `Please check in at the office by ${context.snapshot.required_arrival} (grace until ${context.snapshot.grace_until}).`,
          linkUrl: internLink(),
          hours: 18,
        });
        if (sent) sentCount += 1;
      }
    }
    return { sent: sentCount };
  },

  computeMetrics: computeAttendanceMetrics,
  computeOverallScore,
  normalizeSettings,
};

function csvEscape(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildCsv(meta, rows) {
  const header = [
    'date', 'intern', 'email', 'department', 'internship', 'status', 'check_in',
    'office', 'distance_m', 'accuracy_m', 'source', 'suspicious', 'notes',
  ];
  const lines = [
    `# Trakive attendance export`,
    `# generated_at=${meta.generatedAt}`,
    `# generated_by=${meta.generatedBy}`,
    `# rows=${meta.rowCount}`,
    `# filters=${JSON.stringify(meta.filters || {})}`,
    header.join(','),
  ];
  for (const row of rows) {
    lines.push([
      row.date, `${row.intern_first_name || ''} ${row.intern_last_name || ''}`.trim(),
      row.intern_email, row.department_name, row.internship_title, row.status, row.check_in,
      row.office_name, row.distance_m, row.location_accuracy_m, row.source, row.is_suspicious, row.notes,
    ].map(csvEscape).join(','));
  }
  return lines.join('\n');
}

function pdfEscape(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(meta, rows) {
  const lines = [
    'Trakive Attendance Report',
    `Generated: ${meta.generatedAt}`,
    `By: ${meta.generatedBy}`,
    `Rows: ${meta.rowCount}`,
    `Filters: ${JSON.stringify(meta.filters || {})}`,
    '',
  ];
  rows.slice(0, 80).forEach((row) => {
    lines.push(
      `${String(row.date).slice(0, 10)}  ${(row.intern_first_name || '')} ${(row.intern_last_name || '')}  ${row.status}  ${row.check_in ? String(row.check_in).slice(11, 16) : '--'}  ${row.office_name || ''}`
    );
  });
  if (rows.length > 80) lines.push(`… and ${rows.length - 80} more rows`);
  const content = lines.map((line, i) => `BT /F1 10 Tf 40 ${760 - i * 14} Td (${pdfEscape(line)}) Tj ET`).join('\n');
  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj');
  objects.push(`4 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream endobj`);
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${obj}\n`;
  });
  const xrefPos = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

module.exports = AttendanceService;
