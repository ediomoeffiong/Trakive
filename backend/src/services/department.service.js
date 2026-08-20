const ApiError = require('../utils/apiError');
const DepartmentModel = require('../models/department.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const DepartmentService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async createDepartment(data, requestingUser, ipAddress = null, userAgent = null) {
    const orgId = await this.getEffectiveOrgId(requestingUser);

    if (data.head_user_id) {
      const headUser = await UserModel.findByIdWithRoleAndPermissions(data.head_user_id);
      if (!headUser) {
        throw ApiError.notFound('Assigned department head user not found');
      }
    }

    const department = await DepartmentModel.create({
      organization_id: orgId,
      name: data.name,
      code: data.code,
      description: data.description,
      head_user_id: data.head_user_id || null,
    });

    if (data.head_user_id) {
      await ProfileModel.upsertHeadProfile({
        user_id: data.head_user_id,
        organization_id: orgId,
        department_id: department.id,
      });
      await UserModel.update(data.head_user_id, { department_id: department.id });
    }

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'DEPARTMENT_CREATE',
      entityType: 'departments',
      entityId: department.id,
      details: { name: department.name, code: department.code },
      ipAddress,
      userAgent,
    });

    return department;
  },

  async updateDepartment(id, data, requestingUser, ipAddress = null, userAgent = null) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    if (data.head_user_id !== undefined && data.head_user_id !== null) {
      const headUser = await UserModel.findById(data.head_user_id);
      if (!headUser) {
        throw ApiError.notFound('Assigned department head user not found');
      }
      await ProfileModel.upsertHeadProfile({
        user_id: data.head_user_id,
        organization_id: department.organization_id,
        department_id: id,
      });
      await UserModel.update(data.head_user_id, { department_id: id });
    }

    const updated = await DepartmentModel.update(id, data);

    await AuditLogModel.log({
      organizationId: department.organization_id,
      userId: requestingUser.id,
      action: 'DEPARTMENT_UPDATE',
      entityType: 'departments',
      entityId: id,
      details: data,
      ipAddress,
      userAgent,
    });

    return updated;
  },

  async assignHead(departmentId, headUserId, requestingUser, ipAddress = null, userAgent = null) {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    const headUser = await UserModel.findById(headUserId);
    if (!headUser) {
      throw ApiError.notFound('Assigned department head user not found');
    }

    const updated = await DepartmentModel.setHead(departmentId, headUserId);
    await ProfileModel.upsertHeadProfile({
      user_id: headUserId,
      organization_id: department.organization_id,
      department_id: departmentId,
    });
    await UserModel.update(headUserId, { department_id: departmentId });

    await AuditLogModel.log({
      organizationId: department.organization_id,
      userId: requestingUser.id,
      action: 'DEPARTMENT_ASSIGN_HEAD',
      entityType: 'departments',
      entityId: departmentId,
      details: { head_user_id: headUserId },
      ipAddress,
      userAgent,
    });

    return updated;
  },

  async assignSupervisors(departmentId, supervisorUserIds = [], requestingUser, ipAddress = null, userAgent = null) {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    const assignedSupervisors = [];
    for (const userId of supervisorUserIds) {
      const user = await UserModel.findById(userId);
      if (user) {
        await UserModel.update(userId, { department_id: departmentId });
        const supProfile = await ProfileModel.upsertSupervisorProfile({
          user_id: userId,
          organization_id: department.organization_id,
          department_id: departmentId,
        });
        assignedSupervisors.push(supProfile);
      }
    }

    await AuditLogModel.log({
      organizationId: department.organization_id,
      userId: requestingUser.id,
      action: 'DEPARTMENT_ASSIGN_SUPERVISORS',
      entityType: 'departments',
      entityId: departmentId,
      details: { supervisor_user_ids: supervisorUserIds },
      ipAddress,
      userAgent,
    });

    return { department, assigned_supervisors: assignedSupervisors };
  },

  async deactivateDepartment(id, requestingUser, ipAddress = null, userAgent = null) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    const deleted = await DepartmentModel.softDelete(id);

    await AuditLogModel.log({
      organizationId: department.organization_id,
      userId: requestingUser.id,
      action: 'DEPARTMENT_DEACTIVATE',
      entityType: 'departments',
      entityId: id,
      details: { name: department.name },
      ipAddress,
      userAgent,
    });

    return deleted;
  },

  async listDepartments(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const orgId = reqRole === 'super_admin' ? null : (requestingUser.organization_id || (await this.getEffectiveOrgId(requestingUser)));

    const items = await DepartmentModel.findPaginated({
      organization_id: orgId,
      search: query.search || '',
      limit,
      offset,
    });

    const totalItems = await DepartmentModel.count({
      organization_id: orgId,
      search: query.search || '',
    });

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async getDepartmentWithStaff(departmentId, requestingUser) {
    const department = await DepartmentModel.findById(departmentId);
    if (!department) {
      throw ApiError.notFound('Department not found');
    }

    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (reqRole === 'head' || reqRole === 'department_head') {
      if (requestingUser.department_id && requestingUser.department_id !== departmentId) {
        throw ApiError.forbidden('Access denied to other department data');
      }
    }

    const staff = await DepartmentModel.getStaff(departmentId);

    return {
      department,
      staff,
    };
  },
};

module.exports = DepartmentService;
