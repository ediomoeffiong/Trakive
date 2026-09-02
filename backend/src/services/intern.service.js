const ApiError = require('../utils/apiError');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const RoleModel = require('../models/role.model');
const AuditLogModel = require('../models/auditLog.model');
const { hashPassword } = require('../utils/password.utils');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const InternService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async createIntern(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    const internRole = await RoleModel.findByName('intern');
    if (!internRole) {
      throw ApiError.internal('Intern system role not configured');
    }

    const passwordHash = await hashPassword(data.password || 'TrakiveIntern2026!');

    const user = await UserModel.create({
      organization_id: orgId,
      department_id: data.department_id || null,
      role_id: internRole.id,
      email: data.email,
      password_hash: passwordHash,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      status: 'active',
      is_email_verified: true,
    });

    let supervisorProfileId = data.supervisor_id || null;

    const internProfile = await ProfileModel.upsertInternProfile({
      user_id: user.id,
      organization_id: orgId,
      department_id: data.department_id || null,
      supervisor_id: supervisorProfileId,
      institution: data.institution || null,
      field_of_study: data.field_of_study || null,
      academic_year: data.academic_year || null,
      emergency_contact: data.emergency_contact || {},
      skills: data.skills || [],
      status: 'onboarding',
    });

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'INTERN_CREATE',
      entityType: 'intern_profiles',
      entityId: internProfile.id,
      details: { email: user.email, user_id: user.id },
      ipAddress,
      userAgent,
    });

    return await ProfileModel.getCompleteInternProfile(user.id);
  },

  async getIntern(internUserId, requestingUser) {
    const completeProfile = await ProfileModel.getCompleteInternProfile(internUserId);
    if (!completeProfile) {
      throw ApiError.notFound('Intern profile not found');
    }

    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    if (reqRole === 'intern' && requestingUser.id !== internUserId) {
      throw ApiError.forbidden('Interns can only access their own profile');
    }

    if (reqRole === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (!supProfile || completeProfile.supervisor_id !== supProfile.id) {
        throw ApiError.forbidden('Supervisors can only access assigned interns');
      }
    }

    if (reqRole === 'head' || reqRole === 'department_head') {
      if (requestingUser.department_id && requestingUser.department_id !== completeProfile.department_id) {
        throw ApiError.forbidden('Department heads can only access interns within their department');
      }
    }

    return completeProfile;
  },

  async updateIntern(internUserId, data, requestingUser, ipAddress = null, userAgent = null) {
    const profile = await ProfileModel.getCompleteInternProfile(internUserId);
    if (!profile) {
      throw ApiError.notFound('Intern profile not found');
    }

    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (reqRole === 'intern' && requestingUser.id !== internUserId) {
      throw ApiError.forbidden('Interns can only update their own profile');
    }
    if (reqRole === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (!supProfile || profile.supervisor_id !== supProfile.id) {
        throw ApiError.forbidden('Supervisors can only update assigned interns');
      }
    }

    const userUpdates = {};
    if (data.first_name !== undefined) userUpdates.first_name = data.first_name;
    if (data.last_name !== undefined) userUpdates.last_name = data.last_name;
    if (data.phone !== undefined) userUpdates.phone = data.phone;
    if (data.department_id !== undefined) userUpdates.department_id = data.department_id;

    if (Object.keys(userUpdates).length > 0) {
      await UserModel.update(internUserId, userUpdates);
    }

    await ProfileModel.upsertInternProfile({
      user_id: internUserId,
      organization_id: profile.organization_id,
      department_id: data.department_id !== undefined ? data.department_id : profile.department_id,
      supervisor_id: data.supervisor_id !== undefined ? data.supervisor_id : profile.supervisor_id,
      institution: data.institution,
      field_of_study: data.field_of_study,
      academic_year: data.academic_year,
      emergency_contact: data.emergency_contact,
      skills: data.skills,
      status: data.status || profile.intern_status,
    });

    await AuditLogModel.log({
      organizationId: profile.organization_id,
      userId: requestingUser.id,
      action: 'INTERN_UPDATE',
      entityType: 'intern_profiles',
      entityId: internUserId,
      details: data,
      ipAddress,
      userAgent,
    });

    return await ProfileModel.getCompleteInternProfile(internUserId);
  },

  async listInterns(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const orgId = reqRole === 'super_admin' ? null : (requestingUser.organization_id || (await this.getEffectiveOrgId(requestingUser)));

    let departmentFilter = query.department_id || null;
    let supervisorFilter = query.supervisor_id || null;

    if (reqRole === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile) {
        supervisorFilter = supProfile.id;
      }
    } else if (reqRole === 'head' || reqRole === 'department_head') {
      if (requestingUser.department_id) {
        departmentFilter = requestingUser.department_id;
      }
    }

    const items = await UserModel.findPaginated({
      organization_id: orgId,
      search: query.search || '',
      role: 'intern',
      department_id: departmentFilter,
      status: '',
      limit,
      offset,
    });

    const totalItems = await UserModel.count({
      organization_id: orgId,
      search: query.search || '',
      role: 'intern',
      department_id: departmentFilter,
    });

    const enrichedItems = await Promise.all(
      items.map(async (u) => {
        const full = await ProfileModel.getCompleteInternProfile(u.id);
        return full || u;
      })
    );

    return formatPaginatedResponse(enrichedItems, totalItems, page, limit);
  },

  async updateInternStatus(internUserId, status, requestingUser, ipAddress = null, userAgent = null) {
    const profile = await ProfileModel.getCompleteInternProfile(internUserId);
    if (!profile) {
      throw ApiError.notFound('Intern profile not found');
    }

    const updatedProfile = await ProfileModel.updateInternStatus(internUserId, status);

    await AuditLogModel.log({
      organizationId: profile.organization_id,
      userId: requestingUser.id,
      action: `INTERN_STATUS_${status.toUpperCase()}`,
      entityType: 'intern_profiles',
      entityId: internUserId,
      details: { previous_status: profile.intern_status, new_status: status },
      ipAddress,
      userAgent,
    });

    return updatedProfile;
  },

  async assignDepartment(internUserId, departmentId, requestingUser, ipAddress = null, userAgent = null) {
    const profile = await ProfileModel.getCompleteInternProfile(internUserId);
    if (!profile) {
      throw ApiError.notFound('Intern profile not found');
    }

    const updated = await ProfileModel.assignInternDepartmentAndSupervisor(internUserId, departmentId, profile.supervisor_id);

    await AuditLogModel.log({
      organizationId: profile.organization_id,
      userId: requestingUser.id,
      action: 'INTERN_ASSIGN_DEPARTMENT',
      entityType: 'intern_profiles',
      entityId: internUserId,
      details: { department_id: departmentId },
      ipAddress,
      userAgent,
    });

    return await ProfileModel.getCompleteInternProfile(internUserId);
  },

  async assignSupervisor(internUserId, supervisorProfileId, requestingUser, ipAddress = null, userAgent = null) {
    const profile = await ProfileModel.getCompleteInternProfile(internUserId);
    if (!profile) {
      throw ApiError.notFound('Intern profile not found');
    }

    let supProfile = await ProfileModel.findSupervisorById(supervisorProfileId);
    if (!supProfile) {
      supProfile = await ProfileModel.findSupervisorProfileByUserId(supervisorProfileId);
    }
    if (!supProfile) {
      throw ApiError.notFound('Supervisor profile not found');
    }

    const supUser = await UserModel.findById(supProfile.user_id);
    const supervisorDeptId = supProfile.department_id || (supUser ? supUser.department_id : null);
    const internDeptId = profile.department_id;

    if (internDeptId && supervisorDeptId && internDeptId !== supervisorDeptId) {
      throw ApiError.badRequest("Selected supervisor does not belong to the intern's department");
    }

    const targetDeptId = internDeptId || supervisorDeptId;

    await ProfileModel.assignInternDepartmentAndSupervisor(
      internUserId,
      targetDeptId,
      supProfile.id
    );

    // If intern user account was pending, activate it upon supervisor assignment
    if (profile.user_status === 'pending') {
      await UserModel.updateStatus(internUserId, 'active');
    }

    // Record supervisor assignment history
    if (profile.intern_profile_id) {
      await ProfileModel.recordSupervisorAssignment(
        profile.intern_profile_id,
        supProfile.id,
        requestingUser.id,
        'active',
        'Supervisor assigned by Super Admin'
      );
    }

    await AuditLogModel.log({
      organizationId: profile.organization_id,
      userId: requestingUser.id,
      action: 'INTERN_ASSIGN_SUPERVISOR',
      entityType: 'intern_profiles',
      entityId: internUserId,
      details: { supervisor_id: supProfile.id, department_id: targetDeptId },
      ipAddress,
      userAgent,
    });

    return await ProfileModel.getCompleteInternProfile(internUserId);
  },

  async getInternHistory(internUserId, requestingUser) {
    const profile = await this.getIntern(internUserId, requestingUser);
    let assignmentHistory = [];
    if (profile && profile.intern_profile_id) {
      assignmentHistory = await ProfileModel.getSupervisorAssignmentHistory(profile.intern_profile_id);
    }
    return {
      profile,
      assignment_history: assignmentHistory,
    };
  },
};

module.exports = InternService;
