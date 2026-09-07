const ApiError = require('../utils/apiError');
const ProjectModel = require('../models/project.model');
const ProfileModel = require('../models/profile.model');
const NotificationModel = require('../models/notification.model');
const AuditLogModel = require('../models/auditLog.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const ProjectService = {
  /**
   * Resolve supervisor profile ID for the requesting user (if supervisor)
   */
  async _getSupervisorProfileId(userId) {
    const profile = await ProfileModel.findSupervisorProfileByUserId(userId);
    return profile ? profile.id : null;
  },

  /**
   * Resolve intern profile from intern user ID
   */
  async _getInternProfile(userId) {
    return ProfileModel.findInternProfileByUserId(userId);
  },

  /**
   * Resolve organization ID from requesting user
   */
  _getOrgId(requestingUser) {
    if (!requestingUser.organization_id) {
      throw ApiError.badRequest('User does not belong to an organization');
    }
    return requestingUser.organization_id;
  },

  /**
   * Authorize project access for the requesting user
   */
  async _authorizeProjectAccess(project, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role === 'admin' || role === 'super_admin' || role === 'hr') return;

    if (role === 'supervisor') {
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      if (project.supervisor_id !== spId) {
        throw ApiError.forbidden('You are not the supervisor of this project');
      }
      return;
    }

    if (role === 'intern') {
      const members = Array.isArray(project.members) ? project.members : [];
      const isMember = members.some((m) => m.intern_id === requestingUser.id);
      // Also allow the creator (if they proposed it)
      if (!isMember && project.creator_id !== requestingUser.id) {
        throw ApiError.forbidden('You are not a member of this project');
      }
      return;
    }

    throw ApiError.forbidden('Access denied');
  },

  /**
   * Supervisor creates and assigns a project to intern(s)
   */
  async createProject(data, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (!['supervisor', 'admin', 'super_admin', 'hr'].includes(role)) {
      throw ApiError.forbidden('Only supervisors and admins can create projects');
    }

    if (!data.title || !data.title.trim()) {
      throw ApiError.badRequest('Project title is required');
    }
    const missing = [];
    if (!data.start_date) missing.push('Start Date');
    if (!data.due_date) missing.push('Due Date');
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];
    milestones.forEach((m, idx) => {
      if (m.title && m.title.trim() && !m.due_date) {
        missing.push(`Milestone ${idx + 1} ("${m.title.trim()}") Due Date`);
      }
    });
    if (missing.length > 0) {
      throw ApiError.badRequest(`Please select a date for the following missing section(s): ${missing.join(', ')}`);
    }

    const orgId = this._getOrgId(requestingUser);
    const spId = role === 'supervisor' ? await this._getSupervisorProfileId(requestingUser.id) : (data.supervisor_id || null);

    const project = await ProjectModel.create({
      organization_id: orgId,
      department_id: data.department_id || requestingUser.department_id || null,
      title: data.title,
      description: data.description || null,
      creator_id: requestingUser.id,
      supervisor_id: spId,
      source: 'supervisor_assigned',
      status: 'active',
      priority: data.priority || 'medium',
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      notes: data.notes || null,
    });

    // Add intern members
    const internIds = Array.isArray(data.intern_ids) ? data.intern_ids : [];
    for (const internId of internIds) {
      await ProjectModel.addMember(project.id, internId, 'member');
    }

    // Add approval history
    await ProjectModel.addApprovalHistory(project.id, 'submitted', requestingUser.id);

    // Notify each assigned intern
    for (const internId of internIds) {
      await NotificationModel.create({
        userId: internId,
        title: 'New Project Assigned',
        message: `You have been assigned to the project "${project.title}".`,
        type: 'project',
        linkUrl: `/dashboard/projects/${project.id}`,
      });
    }

    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'PROJECT_CREATE',
      entityType: 'projects',
      entityId: project.id,
      details: { title: project.title, intern_ids: internIds },
    });

    return ProjectModel.findById(project.id);
  },

  /**
   * Intern proposes a project for supervisor approval
   */
  async proposeProject(data, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') {
      throw ApiError.forbidden('Only interns can propose projects');
    }

    if (!data.title || !data.title.trim()) {
      throw ApiError.badRequest('Project title is required');
    }
    const missing = [];
    if (!data.start_date) missing.push('Start Date');
    if (!data.due_date) missing.push('Due Date');
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];
    milestones.forEach((m, idx) => {
      if (m.title && m.title.trim() && !m.due_date) {
        missing.push(`Milestone ${idx + 1} ("${m.title.trim()}") Due Date`);
      }
    });
    if (missing.length > 0) {
      throw ApiError.badRequest(`Please select a date for the following missing section(s): ${missing.join(', ')}`);
    }

    const orgId = this._getOrgId(requestingUser);

    // Get intern's supervisor
    const internProfile = await this._getInternProfile(requestingUser.id);
    const supervisorProfileId = internProfile ? internProfile.supervisor_id : null;

    const project = await ProjectModel.create({
      organization_id: orgId,
      department_id: requestingUser.department_id || null,
      title: data.title,
      description: data.description || null,
      creator_id: requestingUser.id,
      supervisor_id: supervisorProfileId,
      source: 'intern_proposed',
      status: 'pending_approval',
      priority: data.priority || 'medium',
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      proposed_objectives: data.proposed_objectives || null,
      expected_outcome: data.expected_outcome || null,
      notes: data.notes || null,
    });

    // Self is a member
    await ProjectModel.addMember(project.id, requestingUser.id, 'lead');

    // Add approval history
    await ProjectModel.addApprovalHistory(project.id, 'submitted', requestingUser.id);

    // Notify supervisor
    if (supervisorProfileId) {
      const spProfile = await ProfileModel.findSupervisorById(supervisorProfileId);
      if (spProfile) {
        await NotificationModel.create({
          userId: spProfile.user_id,
          title: 'New Project Proposal',
          message: `${requestingUser.first_name} ${requestingUser.last_name} has proposed a project: "${project.title}". Please review.`,
          type: 'project',
          linkUrl: `/supervisor/projects/${project.id}`,
        });
      }
    }

    return ProjectModel.findById(project.id);
  },

  /**
   * Supervisor approves an intern-proposed project
   */
  async approveProject(projectId, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    if (project.status !== 'pending_approval') {
      throw ApiError.badRequest(`Project is not pending approval (current status: ${project.status})`);
    }

    await this._authorizeProjectAccess(project, requestingUser);

    const updated = await ProjectModel.update(projectId, {
      status: 'active',
      supervisor_feedback: null,
    });

    await ProjectModel.addApprovalHistory(projectId, 'approved', requestingUser.id);

    // Notify intern members
    const members = await ProjectModel.getMembers(projectId);
    for (const member of members) {
      await NotificationModel.create({
        userId: member.intern_id,
        title: 'Project Approved',
        message: `Your project "${project.title}" has been approved and is now active!`,
        type: 'project',
        linkUrl: `/dashboard/projects/${projectId}`,
      });
    }

    return ProjectModel.findById(projectId);
  },

  /**
   * Supervisor rejects an intern-proposed project
   */
  async rejectProject(projectId, reason, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    if (project.status !== 'pending_approval') {
      throw ApiError.badRequest('Project is not pending approval');
    }

    await this._authorizeProjectAccess(project, requestingUser);

    await ProjectModel.update(projectId, {
      status: 'cancelled',
      rejection_reason: reason || 'No reason provided',
    });

    await ProjectModel.addApprovalHistory(projectId, 'rejected', requestingUser.id, reason);

    // Notify intern
    const members = await ProjectModel.getMembers(projectId);
    for (const member of members) {
      await NotificationModel.create({
        userId: member.intern_id,
        title: 'Project Rejected',
        message: `Your project "${project.title}" was not approved. Reason: ${reason || 'See project details'}`,
        type: 'project',
        linkUrl: `/dashboard/projects/${projectId}`,
      });
    }

    return ProjectModel.findById(projectId);
  },

  /**
   * Supervisor requests changes on a proposed project
   */
  async requestChanges(projectId, feedback, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    if (project.status !== 'pending_approval') {
      throw ApiError.badRequest('Project is not pending approval');
    }

    await this._authorizeProjectAccess(project, requestingUser);

    await ProjectModel.update(projectId, { supervisor_feedback: feedback });
    await ProjectModel.addApprovalHistory(projectId, 'changes_requested', requestingUser.id, feedback);

    // Notify intern
    const members = await ProjectModel.getMembers(projectId);
    for (const member of members) {
      await NotificationModel.create({
        userId: member.intern_id,
        title: 'Changes Requested on Project',
        message: `Your supervisor has requested changes to "${project.title}". Please review and resubmit.`,
        type: 'project',
        linkUrl: `/dashboard/projects/${projectId}`,
      });
    }

    return ProjectModel.findById(projectId);
  },

  /**
   * Intern resubmits a revised project proposal
   */
  async resubmitProject(projectId, data, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') throw ApiError.forbidden('Only interns can resubmit projects');

    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    if (project.creator_id !== requestingUser.id) throw ApiError.forbidden('You can only resubmit your own projects');
    if (!['pending_approval', 'cancelled'].includes(project.status)) {
      throw ApiError.badRequest('Project cannot be resubmitted in its current state');
    }

    const updates = {
      status: 'pending_approval',
      supervisor_feedback: null,
      rejection_reason: null,
    };
    if (data.title) updates.title = data.title;
    if (data.description) updates.description = data.description;
    if (data.proposed_objectives) updates.proposed_objectives = data.proposed_objectives;
    if (data.expected_outcome) updates.expected_outcome = data.expected_outcome;
    if (data.start_date) updates.start_date = data.start_date;
    if (data.due_date) updates.due_date = data.due_date;
    if (data.priority) updates.priority = data.priority;

    await ProjectModel.update(projectId, updates);
    await ProjectModel.addApprovalHistory(projectId, 'resubmitted', requestingUser.id);

    // Notify supervisor
    if (project.supervisor_id) {
      const spProfile = await ProfileModel.findSupervisorById(project.supervisor_id);
      if (spProfile) {
        await NotificationModel.create({
          userId: spProfile.user_id,
          title: 'Project Resubmitted',
          message: `${requestingUser.first_name} ${requestingUser.last_name} has resubmitted the project "${project.title}" for review.`,
          type: 'project',
          linkUrl: `/supervisor/projects/${projectId}`,
        });
      }
    }

    return ProjectModel.findById(projectId);
  },

  /**
   * Get a single project (role-scoped)
   */
  async getProject(projectId, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    await this._authorizeProjectAccess(project, requestingUser);

    const approvalHistory = await ProjectModel.getApprovalHistory(projectId);
    return { ...project, approval_history: approvalHistory };
  },

  /**
   * List projects (role-scoped + filtered)
   */
  async listProjects(filters, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    const orgId = this._getOrgId(requestingUser);
    const { limit, offset, page } = getPaginationParams(filters);

    const scopedFilters = {
      ...filters,
      organization_id: orgId,
      limit,
      offset,
    };

    if (role === 'intern') {
      scopedFilters.intern_id = requestingUser.id;
    } else if (role === 'supervisor') {
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      scopedFilters.supervisor_id = spId;
    }
    // admin/head/hr sees all in org (no extra scoping)

    const items = await ProjectModel.findPaginated(scopedFilters);
    const total = await ProjectModel.count(scopedFilters);
    return formatPaginatedResponse(items, total, page, limit);
  },

  /**
   * Update a project
   */
  async updateProject(projectId, data, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    await this._authorizeProjectAccess(project, requestingUser);

    const role = (requestingUser.role_name || '').toLowerCase();
    const allowedForIntern = ['title', 'description', 'proposed_objectives', 'expected_outcome', 'start_date', 'due_date', 'priority', 'notes'];
    const allowedForSupervisor = [...allowedForIntern, 'status', 'supervisor_id', 'department_id'];
    const allowed = role === 'intern' ? allowedForIntern : allowedForSupervisor;

    const updates = {};
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) updates[key] = value;
    }

    const updated = await ProjectModel.update(projectId, updates);

    // Handle member updates (supervisor only)
    if (role !== 'intern' && Array.isArray(data.intern_ids)) {
      // Remove all current members and re-add
      const current = await ProjectModel.getMembers(projectId);
      for (const m of current) {
        await ProjectModel.removeMember(projectId, m.intern_id);
      }
      for (const internId of data.intern_ids) {
        await ProjectModel.addMember(projectId, internId, 'member');
      }
    }

    return ProjectModel.findById(projectId);
  },

  /**
   * Soft-delete a project
   */
  async deleteProject(projectId, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    const role = (requestingUser.role_name || '').toLowerCase();
    if (!['supervisor', 'admin', 'super_admin', 'hr'].includes(role)) {
      throw ApiError.forbidden('Only supervisors and admins can delete projects');
    }

    await this._authorizeProjectAccess(project, requestingUser);
    await ProjectModel.softDelete(projectId);
    return { deleted: true, projectId };
  },

  /**
   * Trigger progress recalculation
   */
  async recalculateProgress(projectId) {
    return ProjectModel.recalculateProgress(projectId);
  },
};

module.exports = ProjectService;
