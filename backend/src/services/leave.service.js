const ApiError = require('../utils/apiError');
const LeaveModel = require('../models/leave.model');
const AttendanceModel = require('../models/attendance.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const NotificationService = require('./notification.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const LeaveService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async checkReviewerScope(leave, requestingUser) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    if (['admin', 'super_admin', 'org_admin', 'hr'].includes(role)) {
      return true;
    }

    if (role === 'intern') {
      throw ApiError.forbidden('Access denied: Interns are not authorized to review leave requests');
    }

    if (role === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile) {
        const internProfile = await ProfileModel.getCompleteInternProfile(leave.intern_id);
        if (internProfile && internProfile.supervisor_id === supProfile.id) {
          return true;
        }
      }
      if (requestingUser.department_id && leave.department_id === requestingUser.department_id) {
        return true;
      }
      if (!requestingUser.department_id && !leave.department_id) {
        return true;
      }
      throw ApiError.forbidden('Access denied: Supervisors can only review leave requests for assigned interns or department');
    }

    if (role === 'head' || role === 'department_head') {
      if (requestingUser.department_id && leave.department_id !== requestingUser.department_id) {
        throw ApiError.forbidden('Access denied: Department heads can only review leave requests within their department');
      }
      return true;
    }

    throw ApiError.forbidden('Access denied to leave request');
  },

  async submitLeave(requestingUser, data, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw ApiError.badRequest('Invalid start_date or end_date format');
    }

    if (endDate < startDate) {
      throw ApiError.badRequest('Invalid leave dates: end_date cannot be before start_date');
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Check for overlapping approved leave
    const overlapping = await LeaveModel.findOverlappingApprovedLeave(
      requestingUser.id,
      startDateStr,
      endDateStr
    );

    if (overlapping) {
      throw ApiError.badRequest('Cannot submit leave: You already have an approved leave request overlapping with the selected date range.');
    }

    const leaveRequest = await LeaveModel.create({
      organizationId: orgId,
      internId: requestingUser.id,
      leaveType: data.leave_type,
      startDate: startDateStr,
      endDate: endDateStr,
      reason: data.reason,
    });

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'leave:submit',
      entityType: 'leave_requests',
      entityId: leaveRequest.id,
      details: { leave_type: data.leave_type, start_date: startDateStr, end_date: endDateStr },
      ipAddress,
      userAgent,
    });

    return leaveRequest;
  },

  async getMyLeaveRequests(requestingUser, queryParams) {
    const { page, limit, offset } = getPaginationParams(queryParams);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const filter = {
      organizationId: orgId,
      internId: requestingUser.id,
      status: queryParams.status || null,
      leaveType: queryParams.leave_type || null,
      startDate: queryParams.start_date || null,
      endDate: queryParams.end_date || null,
      sortBy: queryParams.sort_by || 'created_at',
      order: queryParams.order || 'DESC',
      limit,
      offset,
    };

    const requests = await LeaveModel.findLeaveRequests(filter);
    const total = await LeaveModel.countLeaveRequests(filter);

    return formatPaginatedResponse(requests, total, page, limit);
  },

  async getLeaveRequests(requestingUser, queryParams) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const { page, limit, offset } = getPaginationParams(queryParams);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const filter = {
      organizationId: orgId,
      status: queryParams.status || null,
      leaveType: queryParams.leave_type || null,
      startDate: queryParams.start_date || null,
      endDate: queryParams.end_date || null,
      sortBy: queryParams.sort_by || 'created_at',
      order: queryParams.order || 'DESC',
      limit,
      offset,
    };

    // Scoped RBAC filtering
    if (role === 'intern') {
      filter.internId = requestingUser.id;
    } else if (role === 'supervisor') {
      if (queryParams.intern_id) {
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

    const requests = await LeaveModel.findLeaveRequests(filter);
    const total = await LeaveModel.countLeaveRequests(filter);

    return formatPaginatedResponse(requests, total, page, limit);
  },

  async getLeaveById(requestingUser, id) {
    const leave = await LeaveModel.findById(id);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }

    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role === 'intern' && leave.intern_id !== requestingUser.id) {
      throw ApiError.forbidden('Access denied: Interns can only view their own leave requests');
    }

    return leave;
  },

  async approveLeave(requestingUser, id, data = {}, ipAddress = null, userAgent = null) {
    const leave = await LeaveModel.findById(id);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }

    if (leave.status === 'approved') {
      throw ApiError.badRequest('Leave request has already been approved');
    }

    if (leave.status === 'rejected') {
      throw ApiError.badRequest('Cannot approve a leave request that has already been rejected');
    }

    if (leave.status !== 'pending') {
      throw ApiError.badRequest(`Invalid status transition from '${leave.status}' to 'approved'`);
    }

    await this.checkReviewerScope(leave, requestingUser);

    const updated = await LeaveModel.updateStatus(id, {
      status: 'approved',
      reviewerId: requestingUser.id,
      reviewerComment: data.reviewer_comment || null,
      reviewedAt: new Date(),
    });

    // Auto-sync attendance records for approved leave duration
    const startDateStr = new Date(leave.start_date).toISOString().split('T')[0];
    const endDateStr = new Date(leave.end_date).toISOString().split('T')[0];

    await AttendanceModel.bulkUpsertLeaveAttendance({
      organizationId: leave.organization_id,
      internId: leave.intern_id,
      startDate: startDateStr,
      endDate: endDateStr,
      notes: `Approved Leave (${leave.leave_type}): ${leave.reason}`,
    });

    await AuditLogModel.log({
      organizationId: leave.organization_id,
      userId: requestingUser.id,
      action: 'leave:approve',
      entityType: 'leave_requests',
      entityId: leave.id,
      details: {
        intern_id: leave.intern_id,
        reviewer_comment: data.reviewer_comment || null,
        start_date: startDateStr,
        end_date: endDateStr,
      },
      ipAddress,
      userAgent,
    });

    await NotificationService.createNotification({
      userId: leave.intern_id,
      title: 'Leave Request Approved',
      message: `Your leave request from ${startDateStr} to ${endDateStr} has been approved.`,
      type: 'leave',
      linkUrl: `/leave/${leave.id}`,
    }).catch(() => {});

    return updated;
  },

  async rejectLeave(requestingUser, id, data = {}, ipAddress = null, userAgent = null) {
    const leave = await LeaveModel.findById(id);
    if (!leave) {
      throw ApiError.notFound('Leave request not found');
    }

    if (leave.status === 'rejected') {
      throw ApiError.badRequest('Leave request has already been rejected');
    }

    if (leave.status === 'approved') {
      throw ApiError.badRequest('Cannot reject a leave request that has already been approved');
    }

    if (leave.status !== 'pending') {
      throw ApiError.badRequest(`Invalid status transition from '${leave.status}' to 'rejected'`);
    }

    await this.checkReviewerScope(leave, requestingUser);

    const updated = await LeaveModel.updateStatus(id, {
      status: 'rejected',
      reviewerId: requestingUser.id,
      reviewerComment: data.reviewer_comment || null,
      reviewedAt: new Date(),
    });

    await AuditLogModel.log({
      organizationId: leave.organization_id,
      userId: requestingUser.id,
      action: 'leave:reject',
      entityType: 'leave_requests',
      entityId: leave.id,
      details: {
        intern_id: leave.intern_id,
        reviewer_comment: data.reviewer_comment || null,
      },
      ipAddress,
      userAgent,
    });

    await NotificationService.createNotification({
      userId: leave.intern_id,
      title: 'Leave Request Rejected',
      message: `Your leave request has been rejected.`,
      type: 'leave',
      linkUrl: `/leave/${leave.id}`,
    }).catch(() => {});

    return updated;
  },
};

module.exports = LeaveService;
