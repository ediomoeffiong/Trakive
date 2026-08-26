const UserModel = require('../models/user.model');
const TaskModel = require('../models/task.model');
const AttendanceModel = require('../models/attendance.model');
const LeaveModel = require('../models/leave.model');
const NotificationModel = require('../models/notification.model');
const DocumentModel = require('../models/document.model');
const ConversationModel = require('../models/conversation.model');
const ProfileModel = require('../models/profile.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const SearchService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    return defaultOrgId;
  },

  async searchUsers(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));

    let department_id = query.departmentId || query.department_id || null;
    let supervisor_id = query.supervisorId || query.supervisor_id || null;

    if (reqRole === 'supervisor' && !department_id) {
      department_id = requestingUser.department_id || null;
    }

    const users = await UserModel.findPaginated({
      organization_id,
      search: query.search || '',
      role: query.role || '',
      department_id,
      status: query.status || '',
      limit,
      offset,
    });

    const totalItems = await UserModel.count({
      organization_id,
      search: query.search || '',
      role: query.role || '',
      department_id,
      status: query.status || '',
    });

    return formatPaginatedResponse(users, totalItems, page, limit);
  },

  async searchTasks(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));

    let intern_id = query.internId || query.intern_id || null;
    let supervisor_id = query.supervisorId || query.supervisor_id || null;
    let department_id = query.departmentId || query.department_id || null;

    // RBAC Scoping Enforcement
    if (reqRole === 'intern') {
      intern_id = requestingUser.id; // Interns only view their assigned tasks
    } else if (reqRole === 'supervisor') {
      if (!department_id) department_id = requestingUser.department_id || null;
    }

    const tasks = await TaskModel.findPaginated({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      priority: query.priority || '',
      department_id,
      supervisor_id,
      intern_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'created_at:desc',
    });

    const totalItems = await TaskModel.count({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      priority: query.priority || '',
      department_id,
      supervisor_id,
      intern_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(tasks, totalItems, page, limit);
  },

  async searchAttendance(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));

    let intern_id = query.internId || query.intern_id || null;
    let department_id = query.departmentId || query.department_id || null;

    // RBAC Scoping Enforcement
    if (reqRole === 'intern') {
      intern_id = requestingUser.id; // Interns only view their own attendance
    } else if (reqRole === 'supervisor') {
      if (!department_id) department_id = requestingUser.department_id || null;
    }

    const records = await AttendanceModel.findPaginated({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      intern_id,
      department_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'date:desc',
    });

    const totalItems = await AttendanceModel.count({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      intern_id,
      department_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(records, totalItems, page, limit);
  },

  async searchLeave(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));

    let intern_id = query.internId || query.intern_id || null;
    let department_id = query.departmentId || query.department_id || null;

    // RBAC Scoping Enforcement
    if (reqRole === 'intern') {
      intern_id = requestingUser.id; // Interns only view their own leave requests
    } else if (reqRole === 'supervisor') {
      if (!department_id) department_id = requestingUser.department_id || null;
    }

    const requests = await LeaveModel.findPaginated({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      leave_type: query.type || query.leave_type || '',
      intern_id,
      department_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'created_at:desc',
    });

    const totalItems = await LeaveModel.count({
      organization_id,
      search: query.search || '',
      status: query.status || '',
      leave_type: query.type || query.leave_type || '',
      intern_id,
      department_id,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(requests, totalItems, page, limit);
  },

  async searchNotifications(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const user_id = requestingUser.id; // Always scoped to requesting user

    const notifications = await NotificationModel.findPaginated({
      user_id,
      type: query.type || '',
      is_read: query.is_read || null,
      search: query.search || '',
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'created_at:desc',
    });

    const totalItems = await NotificationModel.count({
      user_id,
      type: query.type || '',
      is_read: query.is_read || null,
      search: query.search || '',
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(notifications, totalItems, page, limit);
  },

  async searchDocuments(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));
    const is_admin_or_hr = reqRole === 'admin' || reqRole === 'hr' || reqRole === 'org_admin' || reqRole === 'super_admin';

    const documents = await DocumentModel.findPaginated({
      organization_id,
      requesting_user_id: requestingUser.id,
      is_admin_or_hr,
      search: query.search || '',
      category: query.category || '',
      owner_id: query.internId || query.intern_id || query.owner_id || null,
      uploader_id: query.uploader_id || null,
      is_private: query.is_private || null,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'created_at:desc',
    });

    const totalItems = await DocumentModel.count({
      organization_id,
      requesting_user_id: requestingUser.id,
      is_admin_or_hr,
      search: query.search || '',
      category: query.category || '',
      owner_id: query.internId || query.intern_id || query.owner_id || null,
      uploader_id: query.uploader_id || null,
      is_private: query.is_private || null,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(documents, totalItems, page, limit);
  },

  async searchMessages(query = {}, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const reqRole = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const organization_id = reqRole === 'super_admin' ? null : (requestingUser.organization_id || await this.getEffectiveOrgId(requestingUser));

    const messages = await ConversationModel.findPaginatedMessages({
      user_id: requestingUser.id,
      organization_id,
      search: query.search || '',
      sender_id: query.sender_id || null,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
      limit,
      offset,
      sort: query.sort || 'created_at:desc',
    });

    const totalItems = await ConversationModel.countMessages({
      user_id: requestingUser.id,
      organization_id,
      search: query.search || '',
      sender_id: query.sender_id || null,
      start_date: query.startDate || query.start_date || null,
      end_date: query.endDate || query.end_date || null,
    });

    return formatPaginatedResponse(messages, totalItems, page, limit);
  },

  async searchGlobal(query = {}, requestingUser) {
    const resource = (query.resource || query.type || '').toLowerCase();
    
    if (resource === 'users' || resource === 'interns') {
      return { resource: 'users', ...(await this.searchUsers(query, requestingUser)) };
    }
    if (resource === 'tasks') {
      return { resource: 'tasks', ...(await this.searchTasks(query, requestingUser)) };
    }
    if (resource === 'attendance') {
      return { resource: 'attendance', ...(await this.searchAttendance(query, requestingUser)) };
    }
    if (resource === 'leave') {
      return { resource: 'leave', ...(await this.searchLeave(query, requestingUser)) };
    }
    if (resource === 'notifications') {
      return { resource: 'notifications', ...(await this.searchNotifications(query, requestingUser)) };
    }
    if (resource === 'documents') {
      return { resource: 'documents', ...(await this.searchDocuments(query, requestingUser)) };
    }
    if (resource === 'messages') {
      return { resource: 'messages', ...(await this.searchMessages(query, requestingUser)) };
    }

    // Default multi-resource search overview if no specific resource parameter is provided
    const [tasks, users, attendance, leave] = await Promise.all([
      this.searchTasks({ ...query, limit: 5 }, requestingUser),
      this.searchUsers({ ...query, limit: 5 }, requestingUser),
      this.searchAttendance({ ...query, limit: 5 }, requestingUser),
      this.searchLeave({ ...query, limit: 5 }, requestingUser),
    ]);

    return {
      tasks: tasks.items,
      users: users.items,
      attendance: attendance.items,
      leave: leave.items,
    };
  },
};

module.exports = SearchService;
