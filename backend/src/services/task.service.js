const ApiError = require('../utils/apiError');
const TaskModel = require('../models/task.model');
const UserModel = require('../models/user.model');
const ProfileModel = require('../models/profile.model');
const AuditLogModel = require('../models/auditLog.model');
const NotificationService = require('./notification.service');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const VALID_TRANSITIONS = {
  draft: ['assigned', 'archived'],
  assigned: ['in_progress', 'submitted', 'reassigned', 'archived'],
  in_progress: ['submitted', 'under_review', 'archived'],
  submitted: ['under_review', 'approved', 'rejected', 'resubmitted'],
  under_review: ['approved', 'rejected', 'resubmitted'],
  rejected: ['resubmitted', 'in_progress'],
  resubmitted: ['under_review', 'approved', 'rejected'],
  approved: [], // Finalized state
};

const TaskService = {
  async getEffectiveOrgId(requestingUser) {
    if (requestingUser.organization_id) return requestingUser.organization_id;
    const defaultOrgId = await ProfileModel.getOrCreateDefaultOrganization();
    await UserModel.update(requestingUser.id, { organization_id: defaultOrgId });
    return defaultOrgId;
  },

  async checkAccessPermission(task, requestingUser) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';

    if (['admin', 'super_admin', 'org_admin'].includes(role)) {
      return true;
    }

    if (role === 'intern') {
      if (task.assignee_id !== requestingUser.id) {
        throw ApiError.forbidden('Access denied: Interns can only access their assigned tasks');
      }
      return true;
    }

    if (role === 'supervisor') {
      if (task.creator_id === requestingUser.id || task.assignee_id === requestingUser.id) {
        return true;
      }
      // Check if assignee is assigned to this supervisor
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile) {
        const internProfile = await ProfileModel.getCompleteInternProfile(task.assignee_id);
        if (internProfile && internProfile.supervisor_id === supProfile.id) {
          return true;
        }
      }
      // If task belongs to same department
      if (requestingUser.department_id && task.department_id === requestingUser.department_id) {
        return true;
      }
      throw ApiError.forbidden('Access denied: Supervisors can only access tasks within their scope');
    }

    if (role === 'head' || role === 'department_head') {
      if (requestingUser.department_id && task.department_id !== requestingUser.department_id) {
        throw ApiError.forbidden('Access denied: Department heads can only access tasks within their department');
      }
      return true;
    }

    if (role === 'hr') {
      return true;
    }

    throw ApiError.forbidden('Access denied to task');
  },

  validateStatusTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) return true;

    // Check if task is already approved/finalized
    if (currentStatus === 'approved') {
      throw ApiError.badRequest('Cannot change status of a finalized/approved task');
    }

    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      throw ApiError.badRequest(`Invalid task status transition from '${currentStatus}' to '${newStatus}'`);
    }

    return true;
  },

  async createTask(data, requestingUser, ipAddress = null, userAgent = null) {
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role === 'intern') {
      throw ApiError.forbidden('Access denied: Interns are not authorized to create tasks');
    }

    const orgId = await this.getEffectiveOrgId(requestingUser);

    // Verify assignee exists
    const assignee = await UserModel.findById(data.assignee_id);
    if (!assignee) {
      throw ApiError.notFound('Assigned user not found');
    }

    // Role check for supervisor
    if (role === 'supervisor') {
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile) {
        const assigneeProfile = await ProfileModel.getCompleteInternProfile(data.assignee_id);
        if (
          assigneeProfile &&
          assigneeProfile.supervisor_id &&
          assigneeProfile.supervisor_id !== supProfile.id &&
          requestingUser.department_id &&
          assignee.department_id !== requestingUser.department_id
        ) {
          throw ApiError.forbidden('Supervisors can only assign tasks to permitted interns in their scope');
        }
      }
    }

    const initialStatus = data.status || (data.assignee_id ? 'assigned' : 'draft');
    const deptId = data.department_id || assignee.department_id || requestingUser.department_id || null;

    const task = await TaskModel.create({
      organization_id: orgId,
      department_id: deptId,
      internship_id: data.internship_id || null,
      creator_id: requestingUser.id,
      assignee_id: data.assignee_id,
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      status: initialStatus,
      due_date: data.due_date || null,
    });

    // Record activity history
    await TaskModel.createActivity({
      task_id: task.id,
      actor_id: requestingUser.id,
      action: 'created',
      details: { title: task.title, initial_status: initialStatus },
    });

    if (data.assignee_id) {
      await TaskModel.createActivity({
        task_id: task.id,
        actor_id: requestingUser.id,
        action: 'assigned',
        details: { assignee_id: data.assignee_id, assignee_name: `${assignee.first_name} ${assignee.last_name}` },
      });

      await NotificationService.createNotification({
        userId: data.assignee_id,
        title: 'Task Assigned',
        message: `You have been assigned task: "${task.title}"`,
        type: 'task',
        linkUrl: `/tasks/${task.id}`,
      }).catch(() => {});
    }

    // Audit log
    await AuditLogModel.log({
      organizationId: orgId,
      userId: requestingUser.id,
      action: 'TASK_CREATE',
      entityType: 'tasks',
      entityId: task.id,
      details: { title: task.title, assignee_id: data.assignee_id },
      ipAddress,
      userAgent,
    });

    return await this.getTask(task.id, requestingUser);
  },

  async getTask(id, requestingUser) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await this.checkAccessPermission(task, requestingUser);

    const latestSubmission = await TaskModel.getLatestSubmission(id);
    const reviews = await TaskModel.getReviewsByTaskId(id);
    const comments = await TaskModel.getCommentsByTaskId(id);
    const activities = await TaskModel.getActivitiesByTaskId(id);

    return {
      ...task,
      latest_submission: latestSubmission,
      reviews,
      comments,
      activities,
    };
  },

  async listTasks(query, requestingUser) {
    const { page, limit, offset } = getPaginationParams(query);
    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    const orgId = ['super_admin'].includes(role)
      ? null
      : (requestingUser.organization_id || (await this.getEffectiveOrgId(requestingUser)));

    let assigneeIdFilter = query.assignee_id || null;
    let assigneeIdsFilter = [];
    let creatorIdFilter = query.creator_id || null;
    let departmentFilter = query.department_id || null;

    if (role === 'intern') {
      assigneeIdFilter = requestingUser.id;
    } else if (role === 'supervisor') {
      // Supervisor can see tasks created by them, or assigned to their assigned interns
      const supProfile = await ProfileModel.findSupervisorProfileByUserId(requestingUser.id);
      if (supProfile) {
        const assignedInterns = await ProfileModel.findInternsBySupervisorId(supProfile.id);
        assigneeIdsFilter = assignedInterns.map((i) => i.user_id);
        assigneeIdsFilter.push(requestingUser.id); // include supervisor themselves
      }
      if (!assigneeIdFilter && assigneeIdsFilter.length === 0) {
        creatorIdFilter = requestingUser.id;
      }
    } else if (role === 'head' || role === 'department_head') {
      if (requestingUser.department_id && !departmentFilter) {
        departmentFilter = requestingUser.department_id;
      }
    }

    const filterObj = {
      organization_id: orgId,
      creator_id: creatorIdFilter,
      assignee_id: assigneeIdFilter,
      assignee_ids: assigneeIdsFilter,
      department_id: departmentFilter,
      status: query.status || '',
      priority: query.priority || '',
      search: query.search || '',
      limit,
      offset,
      sort_by: query.sort_by || 'created_at',
      order: query.order || 'DESC',
    };

    const items = await TaskModel.findPaginated(filterObj);
    const totalItems = await TaskModel.count(filterObj);

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  async updateTask(id, updates, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role === 'intern') {
      throw ApiError.forbidden('Access denied: Interns cannot edit task definitions');
    }

    await this.checkAccessPermission(task, requestingUser);

    if (task.status === 'approved') {
      throw ApiError.badRequest('Cannot update a finalized/approved task');
    }

    if (updates.status && updates.status !== task.status) {
      this.validateStatusTransition(task.status, updates.status);
    }

    // Handle assignee change / reassignment
    if (updates.assignee_id && updates.assignee_id !== task.assignee_id) {
      const newAssignee = await UserModel.findById(updates.assignee_id);
      if (!newAssignee) {
        throw ApiError.notFound('New assigned user not found');
      }

      await TaskModel.createActivity({
        task_id: id,
        actor_id: requestingUser.id,
        action: 'reassigned',
        details: {
          previous_assignee_id: task.assignee_id,
          new_assignee_id: updates.assignee_id,
          new_assignee_name: `${newAssignee.first_name} ${newAssignee.last_name}`,
        },
      });
    }

    const updatedTask = await TaskModel.update(id, updates);

    await TaskModel.createActivity({
      task_id: id,
      actor_id: requestingUser.id,
      action: 'updated',
      details: updates,
    });

    await AuditLogModel.log({
      organizationId: task.organization_id,
      userId: requestingUser.id,
      action: 'TASK_UPDATE',
      entityType: 'tasks',
      entityId: id,
      details: updates,
      ipAddress,
      userAgent,
    });

    return await this.getTask(id, requestingUser);
  },

  async updateTaskStatus(id, newStatus, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await this.checkAccessPermission(task, requestingUser);

    this.validateStatusTransition(task.status, newStatus);

    const updatedTask = await TaskModel.updateStatus(id, newStatus);

    let actionName = 'status_changed';
    if (newStatus === 'in_progress' && (task.status === 'assigned' || task.status === 'todo')) {
      actionName = 'started';
    }

    await TaskModel.createActivity({
      task_id: id,
      actor_id: requestingUser.id,
      action: actionName,
      details: { previous_status: task.status, new_status: newStatus },
    });

    await AuditLogModel.log({
      organizationId: task.organization_id,
      userId: requestingUser.id,
      action: `TASK_STATUS_${newStatus.toUpperCase()}`,
      entityType: 'tasks',
      entityId: id,
      details: { previous_status: task.status, new_status: newStatus },
      ipAddress,
      userAgent,
    });

    return updatedTask;
  },

  async deleteTask(id, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role === 'intern') {
      throw ApiError.forbidden('Access denied: Interns cannot delete or archive tasks');
    }

    await this.checkAccessPermission(task, requestingUser);

    const result = await TaskModel.softDelete(id);

    await TaskModel.createActivity({
      task_id: id,
      actor_id: requestingUser.id,
      action: 'archived',
      details: { archived_at: new Date() },
    });

    await AuditLogModel.log({
      organizationId: task.organization_id,
      userId: requestingUser.id,
      action: 'TASK_ARCHIVE',
      entityType: 'tasks',
      entityId: id,
      details: { title: task.title },
      ipAddress,
      userAgent,
    });

    return result;
  },

  async submitTask(id, submissionData, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    // Ownership check: only assignee can submit
    if (task.assignee_id !== requestingUser.id) {
      throw ApiError.forbidden('Access denied: You can only submit work for tasks assigned to you');
    }

    if (task.status === 'approved') {
      throw ApiError.badRequest('Cannot submit work for an already approved/finalized task');
    }

    const latestSubmission = await TaskModel.getLatestSubmission(id);
    const newVersion = latestSubmission ? latestSubmission.version + 1 : 1;
    const isResubmission = newVersion > 1 || task.status === 'rejected';

    const submissionStatus = 'pending_review';
    const submission = await TaskModel.createSubmission({
      task_id: id,
      intern_id: requestingUser.id,
      submission_text: submissionData.submission_text || null,
      attachments: submissionData.attachments || [],
      version: newVersion,
      status: submissionStatus,
    });

    const targetTaskStatus = isResubmission ? 'resubmitted' : 'submitted';
    await TaskModel.updateStatus(id, targetTaskStatus);

    const activityAction = isResubmission ? 'resubmitted' : 'submitted';
    await TaskModel.createActivity({
      task_id: id,
      actor_id: requestingUser.id,
      action: activityAction,
      details: { version: newVersion, submission_id: submission.id },
    });

    await AuditLogModel.log({
      organizationId: task.organization_id,
      userId: requestingUser.id,
      action: isResubmission ? 'TASK_RESUBMIT' : 'TASK_SUBMIT',
      entityType: 'task_submissions',
      entityId: submission.id,
      details: { task_id: id, version: newVersion },
      ipAddress,
      userAgent,
    });

    if (task.creator_id) {
      await NotificationService.createNotification({
        userId: task.creator_id,
        title: isResubmission ? 'Task Resubmitted' : 'Task Submitted',
        message: `Task "${task.title}" has been submitted for review`,
        type: 'task',
        linkUrl: `/tasks/${task.id}`,
      }).catch(() => {});
    }

    return submission;
  },

  async reviewTask(id, reviewData, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    const role = requestingUser.role_name ? requestingUser.role_name.toLowerCase() : '';
    if (role === 'intern') {
      throw ApiError.forbidden('Access denied: Interns cannot review task submissions');
    }

    await this.checkAccessPermission(task, requestingUser);

    if (task.status === 'approved') {
      throw ApiError.badRequest('Task has already been reviewed and approved');
    }

    const latestSubmission = await TaskModel.getLatestSubmission(id);
    const targetSubmissionId = reviewData.submission_id || (latestSubmission ? latestSubmission.id : null);

    if (!targetSubmissionId) {
      throw ApiError.badRequest('No task submission found to review');
    }

    const reviewStatus = reviewData.status; // 'approved', 'rejected', or 'revision_requested'
    const review = await TaskModel.createReview({
      task_id: id,
      submission_id: targetSubmissionId,
      reviewer_id: requestingUser.id,
      rating: reviewData.rating || null,
      feedback: reviewData.feedback || null,
      status: reviewStatus,
    });

    // Update submission status
    await TaskModel.updateSubmissionStatus(targetSubmissionId, reviewStatus);

    // Update task status according to review outcome
    let finalTaskStatus = 'under_review';
    if (reviewStatus === 'approved') {
      finalTaskStatus = 'approved';
    } else if (reviewStatus === 'rejected' || reviewStatus === 'revision_requested') {
      finalTaskStatus = 'rejected';
    }

    await TaskModel.updateStatus(id, finalTaskStatus);

    await TaskModel.createActivity({
      task_id: id,
      actor_id: requestingUser.id,
      action: 'reviewed',
      details: {
        review_id: review.id,
        outcome: reviewStatus,
        rating: reviewData.rating,
        feedback: reviewData.feedback,
      },
    });

    if (finalTaskStatus === 'approved') {
      await TaskModel.createActivity({
        task_id: id,
        actor_id: requestingUser.id,
        action: 'approved',
        details: { review_id: review.id },
      });
    } else if (finalTaskStatus === 'rejected') {
      await TaskModel.createActivity({
        task_id: id,
        actor_id: requestingUser.id,
        action: 'rejected',
        details: { review_id: review.id, feedback: reviewData.feedback },
      });
    }

    await AuditLogModel.log({
      organizationId: task.organization_id,
      userId: requestingUser.id,
      action: `TASK_REVIEW_${reviewStatus.toUpperCase()}`,
      entityType: 'task_reviews',
      entityId: review.id,
      details: { task_id: id, status: reviewStatus, rating: reviewData.rating },
      ipAddress,
      userAgent,
    });

    if (task.assignee_id) {
      await NotificationService.createNotification({
        userId: task.assignee_id,
        title: `Task ${reviewStatus === 'approved' ? 'Approved' : 'Reviewed'}`,
        message: `Your task "${task.title}" review status: ${reviewStatus}`,
        type: 'task',
        linkUrl: `/tasks/${task.id}`,
      }).catch(() => {});
    }

    return review;
  },

  async addComment(id, commentData, requestingUser, ipAddress = null, userAgent = null) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }

    await this.checkAccessPermission(task, requestingUser);

    const comment = await TaskModel.createComment({
      task_id: id,
      user_id: requestingUser.id,
      content: commentData.content,
    });

    return comment;
  },

  async getComments(id, requestingUser) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    await this.checkAccessPermission(task, requestingUser);
    return await TaskModel.getCommentsByTaskId(id);
  },

  async getSubmissions(id, requestingUser) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    await this.checkAccessPermission(task, requestingUser);
    return await TaskModel.getSubmissionsByTaskId(id);
  },

  async getReviews(id, requestingUser) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    await this.checkAccessPermission(task, requestingUser);
    return await TaskModel.getReviewsByTaskId(id);
  },

  async getActivities(id, requestingUser) {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw ApiError.notFound('Task not found');
    }
    await this.checkAccessPermission(task, requestingUser);
    return await TaskModel.getActivitiesByTaskId(id);
  },
};

module.exports = TaskService;
