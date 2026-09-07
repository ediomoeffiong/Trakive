const ApiError = require('../utils/apiError');
const MilestoneModel = require('../models/milestone.model');
const ProjectModel = require('../models/project.model');
const ProfileModel = require('../models/profile.model');

const MilestoneService = {
  async _getSupervisorProfileId(userId) {
    const profile = await ProfileModel.findSupervisorProfileByUserId(userId);
    return profile ? profile.id : null;
  },

  async _authorizeProjectWrite(project, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (['admin', 'super_admin', 'hr'].includes(role)) return;
    if (role === 'supervisor') {
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      if (project.supervisor_id !== spId) {
        throw ApiError.forbidden('You are not the supervisor of this project');
      }
      return;
    }
    throw ApiError.forbidden('Only supervisors can manage milestones');
  },

  async _authorizeProjectRead(project, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (['admin', 'super_admin', 'hr'].includes(role)) return;
    if (role === 'supervisor') {
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      if (project.supervisor_id !== spId) throw ApiError.forbidden('Access denied');
      return;
    }
    if (role === 'intern') {
      const members = Array.isArray(project.members) ? project.members : [];
      const isMember = members.some((m) => m.intern_id === requestingUser.id);
      if (!isMember && project.creator_id !== requestingUser.id) {
        throw ApiError.forbidden('You are not a member of this project');
      }
      return;
    }
    throw ApiError.forbidden('Access denied');
  },

  async listMilestones(projectId, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await this._authorizeProjectRead(project, requestingUser);
    return MilestoneModel.findByProjectId(projectId);
  },

  async createMilestone(projectId, data, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await this._authorizeProjectWrite(project, requestingUser);

    // Determine order_index
    const existing = await MilestoneModel.findByProjectId(projectId);
    const order_index = existing.length;

    const milestone = await MilestoneModel.create({
      project_id: projectId,
      title: data.title,
      description: data.description || null,
      start_date: data.start_date || null,
      due_date: data.due_date || null,
      order_index,
    });

    return milestone;
  },

  async updateMilestone(projectId, milestoneId, data, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await this._authorizeProjectWrite(project, requestingUser);

    const milestone = await MilestoneModel.findById(milestoneId);
    if (!milestone || milestone.project_id !== projectId) {
      throw ApiError.notFound('Milestone not found in this project');
    }

    // If marking completed, set completion_date
    const updates = { ...data };
    if (data.status === 'completed' && !data.completion_date) {
      updates.completion_date = new Date().toISOString().split('T')[0];
    }

    return MilestoneModel.update(milestoneId, updates);
  },

  async deleteMilestone(projectId, milestoneId, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await this._authorizeProjectWrite(project, requestingUser);

    const milestone = await MilestoneModel.findById(milestoneId);
    if (!milestone || milestone.project_id !== projectId) {
      throw ApiError.notFound('Milestone not found in this project');
    }

    return MilestoneModel.delete(milestoneId);
  },

  async reorderMilestones(projectId, orderedIds, requestingUser) {
    const project = await ProjectModel.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await this._authorizeProjectWrite(project, requestingUser);

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw ApiError.badRequest('ordered_ids must be a non-empty array');
    }

    await MilestoneModel.reorder(projectId, orderedIds);
    return MilestoneModel.findByProjectId(projectId);
  },
};

module.exports = MilestoneService;
