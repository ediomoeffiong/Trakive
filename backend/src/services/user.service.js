const ApiError = require('../utils/apiError');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const UserService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async getProfile(userId) {
    const user = await UserModel.findByIdWithRoleAndPermissions(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    let extendedProfile = null;
    const roleName = user.role_name ? user.role_name.toLowerCase() : '';

    if (roleName === 'intern') {
      extendedProfile = await ProfileModel.getCompleteInternProfile(userId);
    } else if (roleName === 'supervisor') {
      extendedProfile = await ProfileModel.findSupervisorProfileByUserId(userId);
    } else if (roleName === 'head' || roleName === 'department_head') {
      extendedProfile = await ProfileModel.findHeadProfileByUserId(userId);
    }

    return {
      user: UserModel.sanitizeUser(user),
      role_profile: extendedProfile,
    };
  },

  async updateProfile(userId, data) {
    const user = await UserModel.findByIdWithRoleAndPermissions(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userUpdates = {};
    if (data.first_name !== undefined) userUpdates.first_name = data.first_name;
    if (data.last_name !== undefined) userUpdates.last_name = data.last_name;
    if (data.phone !== undefined) userUpdates.phone = data.phone;

    if (Object.keys(userUpdates).length > 0) {
      await UserModel.update(userId, userUpdates);
    }

    // Re-fetch user with role and permissions
    const updatedUser = await UserModel.findByIdWithRoleAndPermissions(userId);

    const roleName = updatedUser.role_name ? updatedUser.role_name.toLowerCase() : '';
    let updatedRoleProfile = null;

    if (roleName === 'intern') {
      updatedRoleProfile = await ProfileModel.upsertInternProfile({
        user_id: userId,
        organization_id: updatedUser.organization_id,
        institution: data.institution,
        field_of_study: data.field_of_study,
        academic_year: data.academic_year,
        emergency_contact: data.emergency_contact,
        skills: data.skills,
      });
    } else if (roleName === 'supervisor') {
      updatedRoleProfile = await ProfileModel.upsertSupervisorProfile({
        user_id: userId,
        organization_id: updatedUser.organization_id,
        title: data.title,
        specialization: data.specialization,
      });
    } else if (roleName === 'head' || roleName === 'department_head') {
      updatedRoleProfile = await ProfileModel.upsertHeadProfile({
        user_id: userId,
        organization_id: updatedUser.organization_id,
        title: data.title,
        bio: data.bio,
      });
    }

    return {
      user: UserModel.sanitizeUser(updatedUser),
      role_profile: updatedRoleProfile,
    };
  },

  async updateAvatar(userId, avatar_url) {
    const result = await UserModel.updateAvatar(userId, avatar_url);
    if (!result) {
      throw ApiError.notFound('User not found');
    }
    return result;
  },

  async getUserById(id, requestingUser) {
    const user = await UserModel.findByIdWithRoleAndPermissions(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (reqRole !== 'super_admin' && user.organization_id && requestingUser.organization_id && user.organization_id !== requestingUser.organization_id) {
      throw ApiError.forbidden('Access denied to user outside your organization');
    }

    let extendedProfile = null;
    const roleName = user.role_name ? user.role_name.toLowerCase() : '';
    if (roleName === 'intern') {
      extendedProfile = await ProfileModel.getCompleteInternProfile(id);
    } else if (roleName === 'supervisor') {
      extendedProfile = await ProfileModel.findSupervisorProfileByUserId(id);
    } else if (roleName === 'head' || roleName === 'department_head') {
      extendedProfile = await ProfileModel.findHeadProfileByUserId(id);
    }

    return {
      user: UserModel.sanitizeUser(user),
      role_profile: extendedProfile,
    };
  },

  async listUsers(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || (await this.getEffectiveOrgId(requestingUser)));

    const users = await UserModel.findPaginated({
      organization_id,
      search: query.search || '',
      role: query.role || '',
      department_id: query.department_id || null,
      status: query.status || '',
      limit,
      offset,
    });

    const totalItems = await UserModel.count({
      organization_id,
      search: query.search || '',
      role: query.role || '',
      department_id: query.department_id || null,
      status: query.status || '',
    });

    return formatPaginatedResponse(users, totalItems, page, limit);
  },

  async updateUserStatus(targetUserId, status, requestingUser, ipAddress = null, userAgent = null) {
    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      throw ApiError.notFound('Target user not found');
    }

    const updated = await UserModel.updateStatus(targetUserId, status);
    const orgId = await this.getEffectiveOrgId(requestingUser);

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: `USER_STATUS_${status.toUpperCase()}`,
      entityType: 'users',
      entityId: targetUserId,
      details: { previous_status: targetUser.status, new_status: status },
      ipAddress,
      userAgent,
    });

    return updated;
  },
};

module.exports = UserService;
