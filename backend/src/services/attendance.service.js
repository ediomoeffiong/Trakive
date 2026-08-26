const ApiError = require('../utils/apiError');
const AttendanceModel = require('../models/attendance.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const AttendanceService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async clockIn(requestingUser, data = {}, ipAddress = null, userAgent = null) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role !== 'intern' && role !== 'admin' && role !== 'org_admin' && role !== 'super_admin') {
      throw ApiError.forbidden('Only interns can record daily clock-in');
    }

    const orgId = await this.getEffectiveOrgId(requestingUser);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const existing = await AttendanceModel.findByInternAndDate(requestingUser.id, todayStr);
    if (existing) {
      if (existing.check_in && !existing.check_out) {
        throw ApiError.badRequest('Already clocked in for today. Please clock out before clocking in again.');
      }
      if (existing.check_in && existing.check_out) {
        throw ApiError.badRequest('Duplicate attendance: Already completed clock-in and clock-out for today.');
      }
      if (existing.status === 'on_leave') {
        throw ApiError.badRequest('Cannot clock in while on an approved leave.');
      }
    }

    // Server-side Late Detection (Default work start: 09:00 AM local time)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 0);
    const status = isLate ? 'late' : 'present';

    const attendance = await AttendanceModel.create({
      organizationId: orgId,
      internId: requestingUser.id,
      date: todayStr,
      checkIn: now,
      status,
      notes: data.notes || null,
    });

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'attendance:clock_in',
      entityType: 'attendance',
      entityId: attendance.id,
      details: { date: todayStr, check_in: now, status },
      ipAddress,
      userAgent,
    });

    return attendance;
  },

  async clockOut(requestingUser, data = {}, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const existing = await AttendanceModel.findByInternAndDate(requestingUser.id, todayStr);
    if (!existing || !existing.check_in) {
      throw ApiError.badRequest('Clock-out failed: No active clock-in record found for today.');
    }

    if (existing.check_out) {
      throw ApiError.badRequest('Already clocked out for today.');
    }

    const checkInTime = new Date(existing.check_in);
    const durationMs = now.getTime() - checkInTime.getTime();
    const workDurationMinutes = Math.max(0, Math.round(durationMs / (1000 * 60)));

    const updated = await AttendanceModel.updateClockOut(
      existing.id,
      now,
      workDurationMinutes,
      data.notes || null
    );

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'attendance:clock_out',
      entityType: 'attendance',
      entityId: updated.id,
      details: { date: todayStr, check_out: now, work_duration_minutes: workDurationMinutes },
      ipAddress,
      userAgent,
    });

    return updated;
  },

  async getMyAttendance(requestingUser, queryParams) {
    const { page, limit, offset } = getPaginationParams(queryParams);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const filter = {
      organizationId: orgId,
      internId: requestingUser.id,
      startDate: queryParams.start_date || null,
      endDate: queryParams.end_date || null,
      status: queryParams.status || null,
      sortBy: queryParams.sort_by || 'date',
      order: queryParams.order || 'DESC',
      limit,
      offset,
    };

    const attendanceRecords = await AttendanceModel.findAttendance(filter);
    const total = await AttendanceModel.countAttendance(filter);

    return formatPaginatedResponse(attendanceRecords, total, page, limit);
  },

  async getAttendance(requestingUser, queryParams) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const { page, limit, offset } = getPaginationParams(queryParams);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const filter = {
      organizationId: orgId,
      startDate: queryParams.start_date || null,
      endDate: queryParams.end_date || null,
      status: queryParams.status || null,
      sortBy: queryParams.sort_by || 'date',
      order: queryParams.order || 'DESC',
      limit,
      offset,
    };

    // Scoped RBAC filtering
    if (role === 'intern') {
      filter.internId = requestingUser.id;
    } else if (role === 'supervisor') {
      if (queryParams.intern_id) {
        // Verify intern belongs to supervisor
        const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
        if (supProfile) {
          const internProfile = await ProfileModel.getCompleteInternProfile(queryParams.intern_id);
          if (!internProfile || internProfile.supervisor_id !== supProfile.id) {
            throw ApiError.forbidden('Access denied: Intern does not belong to your supervision scope');
          }
        }
        filter.internId = queryParams.intern_id;
      } else {
        const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
        if (supProfile) {
          filter.supervisorId = supProfile.id;
        } else if (requestingUser.department_id) {
          filter.departmentId = requestingUser.department_id;
        }
      }
    } else if (role === 'head' || role === 'department_head') {
      if (requestingUser.department_id) {
        filter.departmentId = requestingUser.department_id;
      }
      if (queryParams.intern_id) {
        filter.internId = queryParams.intern_id;
      }
    } else if (['admin', 'super_admin', 'org_admin', 'hr'].includes(role)) {
      if (queryParams.intern_id) {
        filter.internId = queryParams.intern_id;
      }
      if (queryParams.department_id) {
        filter.departmentId = queryParams.department_id;
      }
    }

    const attendanceRecords = await AttendanceModel.findAttendance(filter);
    const total = await AttendanceModel.countAttendance(filter);

    return formatPaginatedResponse(attendanceRecords, total, page, limit);
  },
};

module.exports = AttendanceService;
