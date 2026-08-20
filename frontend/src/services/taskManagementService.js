/**
 * @file taskManagementService.js
 * @description Service abstraction for the Supervisor Task & Assignment Management module.
 * All methods return Promises with artificial delays to simulate backend responses.
 * Replace mock data imports and delay logic with real Axios API calls when backend is ready.
 */

import { mockSupervisorTasks } from '../data/supervisorTasks';
import { mockTaskTemplates } from '../data/taskTemplates';
import { mockTaskSubmissions } from '../data/taskSubmissions';
import { mockTaskKPIs, mockRecentTaskActivity, mockUpcomingDeadlines } from '../data/taskDashboardData';
import { getTaskTimeline } from '../data/taskTimeline';

// ── Simulated network delay ──────────────────────────────────────────────────
const DELAY_MS = 350;
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// ── In-memory mutable task store ─────────────────────────────────────────────
let tasksStore = JSON.parse(JSON.stringify(mockSupervisorTasks));
let templatesStore = JSON.parse(JSON.stringify(mockTaskTemplates));
let nextId = 100;

// ── Helpers ──────────────────────────────────────────────────────────────────
function applyFilters(tasks, filters = {}) {
  let result = [...tasks];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter((t) => t.status === filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    result = result.filter((t) => t.priority === filters.priority);
  }

  if (filters.department && filters.department !== 'all') {
    result = result.filter((t) => t.department === filters.department);
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter((t) => t.category === filters.category);
  }

  if (filters.internId && filters.internId !== 'all') {
    result = result.filter((t) =>
      t.assignedInterns?.some((i) => i.id === filters.internId)
    );
  }

  return result;
}

// ── Service Methods ──────────────────────────────────────────────────────────

export const taskManagementService = {
  /**
   * Fetch dashboard metrics: KPIs, recent activity, and upcoming deadlines.
   */
  fetchDashboardMetrics: async () => {
    await delay(300);
    return {
      kpis: mockTaskKPIs,
      recentActivity: mockRecentTaskActivity,
      upcomingDeadlines: mockUpcomingDeadlines,
    };
  },

  /**
   * Fetch paginated, filtered task list.
   * @param {object} filters - { search, status, priority, department, category, internId, page, pageSize }
   */
  fetchTasks: async (filters = {}) => {
    await delay();
    const filtered = applyFilters(tasksStore, filters);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      tasks: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  },

  /**
   * Fetch a single task by ID.
   * @param {string} taskId
   */
  fetchTaskById: async (taskId) => {
    await delay(250);
    const task = tasksStore.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    return { task };
  },

  /**
   * Create a new task.
   * @param {object} taskData
   */
  createTask: async (taskData) => {
    await delay(400);
    const newTask = {
      id: `task-${String(++nextId).padStart(3, '0')}`,
      ...taskData,
      createdDate: new Date().toISOString().split('T')[0],
      submissionCount: 0,
      completionPercentage: 0,
      assignedInterns: taskData.assignedInterns || [],
    };
    tasksStore = [newTask, ...tasksStore];
    return { task: newTask };
  },

  /**
   * Update an existing task.
   * @param {string} taskId
   * @param {object} updateData
   */
  updateTask: async (taskId, updateData) => {
    await delay(350);
    const index = tasksStore.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error(`Task ${taskId} not found`);
    tasksStore[index] = { ...tasksStore[index], ...updateData };
    return { task: tasksStore[index] };
  },

  /**
   * Delete a task by ID.
   * @param {string} taskId
   */
  deleteTask: async (taskId) => {
    await delay(300);
    const before = tasksStore.length;
    tasksStore = tasksStore.filter((t) => t.id !== taskId);
    if (tasksStore.length === before) throw new Error(`Task ${taskId} not found`);
    return { success: true, taskId };
  },

  /**
   * Duplicate a task.
   * @param {string} taskId
   */
  duplicateTask: async (taskId) => {
    await delay(350);
    const original = tasksStore.find((t) => t.id === taskId);
    if (!original) throw new Error(`Task ${taskId} not found`);
    const duplicate = {
      ...JSON.parse(JSON.stringify(original)),
      id: `task-${String(++nextId).padStart(3, '0')}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      assignedInterns: [],
      submissionCount: 0,
      completionPercentage: 0,
      createdDate: new Date().toISOString().split('T')[0],
    };
    tasksStore = [duplicate, ...tasksStore];
    return { task: duplicate };
  },

  /**
   * Bulk update multiple tasks.
   * @param {string[]} taskIds
   * @param {object} actionData - { action: 'status'|'archive'|'delete', value }
   */
  bulkUpdateTasks: async (taskIds, actionData) => {
    await delay(400);
    const results = [];

    for (const taskId of taskIds) {
      const index = tasksStore.findIndex((t) => t.id === taskId);
      if (index === -1) continue;

      if (actionData.action === 'delete') {
        tasksStore = tasksStore.filter((t) => t.id !== taskId);
        results.push({ taskId, success: true });
      } else if (actionData.action === 'status') {
        tasksStore[index] = { ...tasksStore[index], status: actionData.value };
        results.push({ taskId, success: true, task: tasksStore[index] });
      } else if (actionData.action === 'archive') {
        tasksStore[index] = { ...tasksStore[index], status: 'archived' };
        results.push({ taskId, success: true, task: tasksStore[index] });
      }
    }

    return { success: true, results, affected: results.length };
  },

  /**
   * Fetch all task templates.
   */
  fetchTemplates: async () => {
    await delay(300);
    return { templates: templatesStore };
  },

  /**
   * Create a new task template.
   * @param {object} templateData
   */
  createTemplate: async (templateData) => {
    await delay(350);
    const newTemplate = {
      id: `tpl-${String(++nextId).padStart(3, '0')}`,
      ...templateData,
      usageCount: 0,
      createdBy: 'Current Supervisor',
      createdDate: new Date().toISOString().split('T')[0],
    };
    templatesStore = [newTemplate, ...templatesStore];
    return { template: newTemplate };
  },

  /**
   * Delete a template.
   * @param {string} templateId
   */
  deleteTemplate: async (templateId) => {
    await delay(250);
    templatesStore = templatesStore.filter((t) => t.id !== templateId);
    return { success: true, templateId };
  },

  /**
   * Fetch all submissions, optionally filtered by taskId.
   * @param {string|null} taskId
   */
  fetchSubmissions: async (taskId = null) => {
    await delay(300);
    const filtered = taskId
      ? mockTaskSubmissions.filter((s) => s.taskId === taskId)
      : mockTaskSubmissions;
    return { submissions: filtered };
  },

  /**
   * Fetch the activity timeline for a specific task.
   * @param {string} taskId
   */
  fetchTaskTimeline: async (taskId) => {
    await delay(250);
    return { timeline: getTaskTimeline(taskId) };
  },

  /**
   * Assign a task to interns.
   * @param {object} assignmentPayload - { taskId, internIds, message }
   */
  assignTask: async (assignmentPayload) => {
    await delay(400);
    const { taskId, internIds } = assignmentPayload;
    const index = tasksStore.findIndex((t) => t.id === taskId);

    // In a real app this would hit the backend
    if (index !== -1) {
      tasksStore[index] = {
        ...tasksStore[index],
        status: tasksStore[index].status === 'draft' ? 'assigned' : tasksStore[index].status,
        totalAssigned: internIds.length,
      };
    }

    return {
      success: true,
      taskId,
      assignedCount: internIds.length,
      message: `Task successfully assigned to ${internIds.length} intern(s)`,
    };
  },

  /**
   * Review a submission (score + feedback).
   * @param {string} submissionId
   * @param {object} reviewData - { score, feedback, status }
   */
  reviewSubmission: async (submissionId, reviewData) => {
    await delay(400);
    return {
      success: true,
      submissionId,
      ...reviewData,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Current Supervisor',
    };
  },
};

export default taskManagementService;
