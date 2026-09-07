const ApiError = require('../utils/apiError');
const WeeklyPlanModel = require('../models/weeklyPlan.model');
const TaskModel = require('../models/task.model');
const NotificationModel = require('../models/notification.model');
const ProfileModel = require('../models/profile.model');
const ProjectModel = require('../models/project.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

/**
 * Get Monday of the week containing the given date (YYYY-MM-DD)
 */
function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().split('T')[0];
}

/**
 * Get Sunday of the week containing the given date
 */
function getWeekEnd(weekStartStr) {
  const date = new Date(weekStartStr);
  date.setUTCDate(date.getUTCDate() + 6);
  return date.toISOString().split('T')[0];
}

const WeeklyPlanService = {
  async _getSupervisorProfileId(userId) {
    const profile = await ProfileModel.findSupervisorProfileByUserId(userId);
    return profile ? profile.id : null;
  },

  /**
   * Get or create a weekly plan for an intern
   */
  async getOrCreateWeekPlan(internId, weekStartInput, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();

    // Interns can only access their own plan
    if (role === 'intern' && requestingUser.id !== internId) {
      throw ApiError.forbidden('You can only access your own weekly plan');
    }

    const weekStart = getWeekStart(weekStartInput || new Date().toISOString().split('T')[0]);
    const weekEnd = getWeekEnd(weekStart);
    const orgId = requestingUser.organization_id;

    const plan = await WeeklyPlanModel.findOrCreate({
      intern_id: internId,
      organization_id: orgId,
      week_start: weekStart,
      week_end: weekEnd,
    });

    return plan;
  },

  /**
   * Get tasks for an intern's specific week
   */
  async getWeeklyTasks(internId, weekStartInput, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();

    if (role === 'intern' && requestingUser.id !== internId) {
      throw ApiError.forbidden('You can only view your own weekly tasks');
    }

    if (role === 'supervisor') {
      // Verify this intern belongs to this supervisor
      const internProfile = await ProfileModel.findInternProfileByUserId(internId);
      if (!internProfile) throw ApiError.notFound('Intern not found');
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      if (internProfile.supervisor_id !== spId) {
        throw ApiError.forbidden('This intern is not assigned to you');
      }
    }

    const weekStart = getWeekStart(weekStartInput || new Date().toISOString().split('T')[0]);
    const tasks = await TaskModel.findByWeek(internId, weekStart);
    return tasks;
  },

  /**
   * Add a task to an intern's weekly plan
   */
  async addTaskToWeek(internId, weekStartInput, taskData, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') throw ApiError.forbidden('Only interns can add tasks to their weekly plan');
    if (requestingUser.id !== internId) throw ApiError.forbidden('You can only add tasks to your own weekly plan');

    const weekStart = getWeekStart(weekStartInput || new Date().toISOString().split('T')[0]);
    const orgId = requestingUser.organization_id;

    // Determine task source
    let taskSource = 'intern_created';
    if (taskData.project_id) taskSource = 'project_task';

    // Validate project membership if provided
    if (taskData.project_id) {
      const project = await ProjectModel.findById(taskData.project_id);
      if (!project) throw ApiError.notFound('Project not found');
      const members = Array.isArray(project.members) ? project.members : [];
      if (!members.some((m) => m.intern_id === internId) && project.creator_id !== internId) {
        throw ApiError.forbidden('You are not a member of this project');
      }
    }

    const task = await TaskModel.create({
      organization_id: orgId,
      department_id: requestingUser.department_id || null,
      creator_id: requestingUser.id,
      assignee_id: internId,
      title: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || 'medium',
      status: 'todo',
      due_date: taskData.due_date || null,
      project_id: taskData.project_id || null,
      milestone_id: taskData.milestone_id || null,
      task_source: taskSource,
      week_start: weekStart,
      weekly_note: taskData.notes || null,
    });

    // Ensure weekly plan exists
    await WeeklyPlanModel.findOrCreate({
      intern_id: internId,
      organization_id: orgId,
      week_start: weekStart,
      week_end: getWeekEnd(weekStart),
    });

    // If linked to a project, recalculate project progress
    if (taskData.project_id) {
      await ProjectModel.recalculateProgress(taskData.project_id);
    }

    return TaskModel.findById(task.id);
  },

  /**
   * Update a task's weekly status (end_of_week_status + weekly_note)
   */
  async updateTaskStatus(taskId, { end_of_week_status, weekly_note }, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') throw ApiError.forbidden('Only interns can update task weekly status');

    const task = await TaskModel.findById(taskId);
    if (!task) throw ApiError.notFound('Task not found');
    if (task.assignee_id !== requestingUser.id) {
      throw ApiError.forbidden('You can only update your own tasks');
    }

    const updated = await TaskModel.updateWeeklyStatus(taskId, { end_of_week_status, weekly_note });

    // Recalculate project progress if linked
    if (task.project_id) {
      await ProjectModel.recalculateProgress(task.project_id);
    }

    return updated;
  },

  /**
   * Intern submits their weekly report
   */
  async submitWeeklyReport(planId, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') throw ApiError.forbidden('Only interns can submit weekly reports');

    const plan = await WeeklyPlanModel.findById(planId);
    if (!plan) throw ApiError.notFound('Weekly plan not found');
    if (plan.intern_id !== requestingUser.id) throw ApiError.forbidden('You can only submit your own weekly report');
    if (plan.status === 'submitted') throw ApiError.badRequest('Weekly report is already submitted');
    if (plan.status === 'reviewed') throw ApiError.badRequest('Weekly report has already been reviewed');

    const updated = await WeeklyPlanModel.update(planId, {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });

    await WeeklyPlanModel.addHistory(planId, 'submitted', requestingUser.id);

    // Notify supervisor
    const internProfile = await ProfileModel.findInternProfileByUserId(requestingUser.id);
    if (internProfile && internProfile.supervisor_id) {
      const spProfile = await ProfileModel.findSupervisorById(internProfile.supervisor_id);
      if (spProfile) {
        await NotificationModel.create({
          userId: spProfile.user_id,
          title: 'Weekly Report Submitted',
          message: `${requestingUser.first_name} ${requestingUser.last_name} has submitted their weekly report for the week of ${plan.week_start}.`,
          type: 'weekly',
          linkUrl: `/supervisor/weekly-review`,
        });
      }
    }

    return updated;
  },

  /**
   * Supervisor reviews a weekly report
   */
  async reviewWeeklyReport(planId, { action, feedback }, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (!['supervisor', 'admin', 'super_admin'].includes(role)) {
      throw ApiError.forbidden('Only supervisors can review weekly reports');
    }

    const plan = await WeeklyPlanModel.findById(planId);
    if (!plan) throw ApiError.notFound('Weekly plan not found');
    if (!['submitted', 'requires_changes'].includes(plan.status)) {
      throw ApiError.badRequest('This plan is not awaiting review');
    }

    if (role === 'supervisor') {
      const internProfile = await ProfileModel.findInternProfileByUserId(plan.intern_id);
      const spId = await this._getSupervisorProfileId(requestingUser.id);
      if (!internProfile || internProfile.supervisor_id !== spId) {
        throw ApiError.forbidden('This intern is not assigned to you');
      }
    }

    const validActions = ['reviewed', 'changes_requested'];
    if (!validActions.includes(action)) {
      throw ApiError.badRequest(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }

    const newStatus = action === 'reviewed' ? 'reviewed' : 'requires_changes';
    const updates = {
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewer_id: requestingUser.id,
      reviewer_feedback: feedback || null,
    };

    const updated = await WeeklyPlanModel.update(planId, updates);
    await WeeklyPlanModel.addHistory(planId, action, requestingUser.id, feedback);

    // Notify intern
    const notifTitle = action === 'reviewed' ? 'Weekly Report Reviewed' : 'Changes Requested on Weekly Report';
    const notifMsg = action === 'reviewed'
      ? `Your weekly report for the week of ${plan.week_start} has been reviewed.`
      : `Your supervisor has requested changes to your weekly report for the week of ${plan.week_start}.`;

    await NotificationModel.create({
      userId: plan.intern_id,
      title: notifTitle,
      message: notifMsg,
      type: 'weekly',
      linkUrl: `/dashboard/weekly-tasks`,
    });

    return updated;
  },

  /**
   * Supervisor view: all intern weekly plans
   */
  async listSupervisorWeekly(filters, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();

    if (!['supervisor', 'admin', 'super_admin', 'hr'].includes(role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }

    const { limit, offset, page } = getPaginationParams(filters);

    let supervisorProfileId = null;
    if (role === 'supervisor') {
      supervisorProfileId = await this._getSupervisorProfileId(requestingUser.id);
      if (!supervisorProfileId) throw ApiError.notFound('Supervisor profile not found');
    }

    const scopedFilters = {
      supervisor_profile_id: supervisorProfileId,
      week_start: filters.week_start || null,
      intern_id: filters.intern_id || null,
      status: filters.status || null,
      limit,
      offset,
    };

    const items = await WeeklyPlanModel.findBySupervisor(scopedFilters);
    const total = await WeeklyPlanModel.countBySupervisor(scopedFilters);

    // For each plan, attach summary stats
    const plansWithStats = await Promise.all(
      items.map(async (plan) => {
        const tasks = await TaskModel.findByWeek(plan.intern_id, plan.week_start);
        const stats = {
          total: tasks.length,
          completed: tasks.filter((t) => t.end_of_week_status === 'completed').length,
          ongoing: tasks.filter((t) => t.end_of_week_status === 'ongoing').length,
          pending: tasks.filter((t) => !t.end_of_week_status || t.end_of_week_status === 'pending').length,
          not_done: tasks.filter((t) => t.end_of_week_status === 'not_done').length,
        };
        return { ...plan, tasks, stats };
      })
    );

    return formatPaginatedResponse(plansWithStats, total, page, limit);
  },

  /**
   * Get intern's own weekly plan list
   */
  async getInternWeeklyPlans(filters, requestingUser) {
    const role = (requestingUser.role_name || '').toLowerCase();
    if (role !== 'intern') throw ApiError.forbidden('Only interns can access this');

    const weekStart = filters.week_start
      ? getWeekStart(filters.week_start)
      : getWeekStart(new Date().toISOString().split('T')[0]);

    const plan = await this.getOrCreateWeekPlan(requestingUser.id, weekStart, requestingUser);
    const tasks = await TaskModel.findByWeek(requestingUser.id, weekStart);
    const history = await WeeklyPlanModel.getHistory(plan.id);

    return { plan, tasks, history, week_start: weekStart, week_end: getWeekEnd(weekStart) };
  },
};

module.exports = WeeklyPlanService;
