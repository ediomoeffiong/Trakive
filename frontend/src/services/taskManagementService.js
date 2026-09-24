/**
 * @file taskManagementService.js
 * @description Service abstraction for the Supervisor Task & Assignment Management module.
 * Uses the shared API when available and falls back to local/demo task data.
 */

import { mockSupervisorTasks } from '../data/supervisorTasks';
import { mockTaskTemplates } from '../data/taskTemplates';
import { mockTaskSubmissions } from '../data/taskSubmissions';
import { mockTaskComments } from '../data/taskComments';
import { mockUserDirectory } from '../data/users';
import { getTaskTimeline } from '../data/taskTimeline';
import api from './api';

const logWarn = (...args) => {
  if (!import.meta.env.PROD) logWarn(...args);
};

const LOCAL_TASKS_KEY = 'trakive_supervisor_tasks_local';
const LOCAL_COMMENTS_KEY = 'trakive_supervisor_task_comments';

// ── Simulated network delay ──────────────────────────────────────────────────
const DELAY_MS = 350;
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// ── In-memory mutable task store ─────────────────────────────────────────────
let tasksStore = [];
let templatesStore = JSON.parse(JSON.stringify(mockTaskTemplates))
  .filter((template) => ['Weekly Progress Report', 'Bug Investigation & Fix'].includes(template.name));
let nextId = 100;

// ── Helpers ──────────────────────────────────────────────────────────────────
const unwrapApiList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return { items: body, meta: {} };
  if (Array.isArray(body?.data)) return { items: body.data, meta: body.meta || {} };
  if (Array.isArray(body?.data?.items)) return { items: body.data.items, meta: body.data.meta || body.meta || {} };
  if (Array.isArray(body?.items)) return { items: body.items, meta: body.pagination || body.meta || {} };
  return { items: [], meta: {} };
};

const toDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const initialsFor = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'IN';

let internAvatarIndex = null;

const readLocalTasks = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalTasks = (tasks) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks));
};

const upsertLocalTask = (task) => {
  const local = readLocalTasks().filter((item) => String(item.id) !== String(task.id));
  writeLocalTasks([{ ...task, _local: true }, ...local]);
};

const markLocalDeleted = (taskId) => {
  const local = readLocalTasks().filter((item) => String(item.id) !== String(taskId));
  writeLocalTasks([{ id: taskId, _deleted: true }, ...local]);
};

const mergeLocalTasks = (remoteTasks = []) => {
  const byId = new Map(remoteTasks.map((task) => [String(task.id), task]));
  readLocalTasks().forEach((localTask) => {
    const key = String(localTask.id);
    if (localTask._deleted) {
      byId.delete(key);
      return;
    }
    const existing = byId.get(key);
    byId.set(key, existing ? { ...existing, ...localTask } : localTask);
  });
  return Array.from(byId.values());
};

const readLocalComments = () => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_COMMENTS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeLocalComments = (store) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(store));
};

const buildInternAvatarIndex = async () => {
  if (internAvatarIndex) return internAvatarIndex;
  internAvatarIndex = {};

  const indexAvatar = (id, email, name, avatar) => {
    if (!avatar) return;
    if (id) internAvatarIndex[String(id)] = internAvatarIndex[String(id)] || avatar;
    if (email) internAvatarIndex[String(email).toLowerCase()] = internAvatarIndex[String(email).toLowerCase()] || avatar;
    if (name) internAvatarIndex[String(name).toLowerCase()] = internAvatarIndex[String(name).toLowerCase()] || avatar;
  };

  mockUserDirectory.forEach((user) => indexAvatar(user.id, user.email, user.name, user.avatar));

  try {
    const res = await api.get('/interns', { params: { limit: 100 } });
    const { items } = unwrapApiList(res);
    items.forEach((intern) => {
      const name = intern.name || intern.fullName || [intern.first_name, intern.last_name].filter(Boolean).join(' ');
      indexAvatar(
        intern.user_id || intern.id,
        intern.email,
        name,
        intern.avatar_url || intern.avatarUrl || intern.avatar
      );
    });
  } catch {
    // Keep directory fallback if intern list is unavailable.
  }

  return internAvatarIndex;
};

const lookupAvatar = (intern = {}, index = internAvatarIndex || {}) =>
  intern.avatar ||
  intern.avatarUrl ||
  intern.avatar_url ||
  index[String(intern.id || '')] ||
  index[String(intern.email || intern.assigneeEmail || '').toLowerCase()] ||
  index[String(intern.name || '').toLowerCase()] ||
  null;

const normalizeStatus = (status, dueDate) => {
  const raw = String(status || 'todo').toLowerCase().replace(/_/g, '-');
  const mapped = {
    todo: 'assigned',
    open: 'assigned',
    assigned: 'assigned',
    draft: 'draft',
    'in-progress': 'in-progress',
    submitted: 'pending-review',
    'in-review': 'pending-review',
    'under-review': 'pending-review',
    reviewed: 'completed',
    approved: 'completed',
    completed: 'completed',
    'revision-requested': 'needs-revision',
    'requires-changes': 'needs-revision',
    'needs-revision': 'needs-revision',
    overdue: 'overdue',
    archived: 'archived',
  }[raw] || raw;

  if (mapped !== 'completed' && mapped !== 'archived' && dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${dueDate}T00:00:00`);
    if (!Number.isNaN(due.getTime()) && due < today && mapped !== 'pending-review') return 'overdue';
  }
  return mapped;
};

const completionForStatus = (status, fallback = 0) => {
  if (typeof fallback === 'number' && fallback > 0) return Math.min(100, fallback);
  if (status === 'completed') return 100;
  if (status === 'pending-review') return 90;
  if (status === 'needs-revision') return 70;
  if (status === 'in-progress') return 45;
  return 0;
};

const normalizeTask = (raw = {}, avatarIndex = internAvatarIndex || {}) => {
  const dueDate = toDateKey(raw.dueDate || raw.due_date);
  const assigneeName = raw.assigneeName || raw.assignee_name ||
    [raw.assignee_first_name, raw.assignee_last_name].filter(Boolean).join(' ') ||
    raw.internName || raw.intern_name || '';
  const assigneeEmail = raw.assigneeEmail || raw.assignee_email || raw.internEmail || '';
  const assigneeId = raw.assignee_id || raw.intern_id || raw.assigneeId || raw.id;
  const assignedInterns = (Array.isArray(raw.assignedInterns)
    ? raw.assignedInterns
    : assigneeName
      ? [{
          id: assigneeId || 'intern',
          name: assigneeName,
          email: assigneeEmail,
          initials: initialsFor(assigneeName),
          avatar: raw.assignee_avatar || raw.assigneeAvatar || raw.avatar_url || raw.avatar,
        }]
      : []
  ).map((intern) => {
    const name = intern.name || intern.fullName || '';
    return {
      ...intern,
      id: intern.id || intern.internId || intern.user_id || intern.assignee_id || intern.email || name,
      name,
      initials: intern.initials || initialsFor(name),
      avatar: lookupAvatar({
        ...intern,
        name,
        email: intern.email || intern.assigneeEmail || assigneeEmail,
      }, avatarIndex),
    };
  });
  const status = raw.status === 'draft' ? 'draft' : normalizeStatus(raw.status, dueDate);
  const completionPercentage = completionForStatus(status, raw.completionPercentage ?? raw.progress);
  const objectives = raw.objectives || raw.learningObjectives || [];
  const attachments = Array.isArray(raw.attachments) ? raw.attachments : [];

  return {
    id: String(raw.id || raw.task_id || `task-${Math.random().toString(36).slice(2)}`),
    title: raw.title || 'Untitled task',
    description: raw.description || '',
    category: raw.category || raw.project_title || raw.milestone_title || 'General',
    priority: String(raw.priority || 'medium').toLowerCase(),
    status,
    dueDate,
    createdDate: toDateKey(raw.createdDate || raw.created_at) || dueDate,
    updatedAt: raw.updated_at || raw.updatedAt,
    department: raw.department || raw.department_name || 'FifthLab',
    assignedInterns,
    totalAssigned: Number(raw.totalAssigned || raw.total_assigned || Math.max(assignedInterns.length, raw.assignee_id ? 1 : 0)),
    submissionCount: Number(raw.submissionCount || raw.submission_count || (['pending-review', 'completed', 'needs-revision'].includes(status) ? 1 : 0)),
    completionPercentage,
    estimatedHours: Number(raw.estimatedHours || raw.estimated_hours || 4),
    tags: raw.tags || [],
    objectives,
    learningObjectives: objectives,
    submissionRequirements: raw.submissionRequirements || '',
    rubric: raw.rubric || [],
    attachments,
    raw,
  };
};

const getStoredTasks = () => {
  if (typeof localStorage === 'undefined') return [];
  const tasks = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key === 'trakive_tasks' || key?.startsWith('trakive_user_tasks_')) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(parsed)) tasks.push(...parsed);
      } catch {
        // Ignore malformed local cache entries.
      }
    }
  }
  return tasks;
};

const syncTaskStore = async () => {
  const avatarIndex = await buildInternAvatarIndex();
  let remoteTasks = [];
  let apiSuccess = false;

  try {
    const response = await api.get('/tasks', { params: { page: 1, limit: 100, sort: 'due_date:asc' } });
    const { items } = unwrapApiList(response);
    remoteTasks = items;
    apiSuccess = true;
  } catch {
    // Offline or unauthenticated demo mode falls through to local data.
  }

  if (!apiSuccess && remoteTasks.length === 0) {
    remoteTasks = [...mockSupervisorTasks, ...getStoredTasks()];
  }

  tasksStore = mergeLocalTasks(remoteTasks).map((task) => normalizeTask(task, avatarIndex));
  return tasksStore;
};

const isActiveTask = (task) => task.status !== 'archived' && task.status !== 'draft';
const countBy = (items, predicate) => items.filter(predicate).length;

const makeKpis = (tasks) => {
  const active = tasks.filter((task) => task.status !== 'archived');
  const total = active.length;
  const pct = (count) => `${total ? Math.round((count / total) * 100) : 0}%`;
  const completed = countBy(active, (task) => task.status === 'completed');
  const inProgress = countBy(active, (task) => ['assigned', 'in-progress', 'needs-revision'].includes(task.status));
  const pendingReview = countBy(active, (task) => task.status === 'pending-review');
  const overdue = countBy(active, (task) => task.status === 'overdue');

  return [
    { id: 'total', label: 'Total Tasks', value: total, trend: pct(total), trendType: 'neutral', color: 'blue', iconName: 'RiTaskLine', filterKey: 'all', description: `${active.filter(isActiveTask).length} active task(s)` },
    { id: 'completed', label: 'Completed', value: completed, trend: pct(completed), trendType: 'positive', color: 'green', iconName: 'RiCheckboxCircleLine', filterKey: 'completed', description: 'Reviewed and done' },
    { id: 'in-progress', label: 'In Progress', value: inProgress, trend: pct(inProgress), trendType: 'neutral', color: 'indigo', iconName: 'RiPlayCircleLine', filterKey: 'in-progress', description: 'Assigned or being worked on' },
    { id: 'pending-review', label: 'Under Review', value: pendingReview, trend: pct(pendingReview), trendType: 'warning', color: 'amber', iconName: 'RiEyeLine', filterKey: 'pending-review', description: 'Submitted and not reviewed' },
    { id: 'overdue', label: 'Overdue', value: overdue, trend: pct(overdue), trendType: 'urgent', color: 'red', iconName: 'RiAlarmWarningLine', filterKey: 'overdue', description: 'Past due date' },
  ];
};

const makeRecentActivity = (tasks) =>
  [...tasks]
    .sort((a, b) => String(b.updatedAt || b.createdDate || '').localeCompare(String(a.updatedAt || a.createdDate || '')))
    .slice(0, 6)
    .map((task) => ({
      id: `activity-${task.id}`,
      type: task.status === 'completed' ? 'completed' : task.status === 'pending-review' ? 'submission' : task.status === 'overdue' ? 'overdue' : 'assigned',
      message: `${task.assignedInterns[0]?.name || 'An intern'} ${task.status === 'pending-review' ? 'submitted' : 'is assigned to'} "${task.title}"`,
      timeAgo: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-GB') : task.createdDate || 'Recently',
      internInitials: task.assignedInterns[0]?.initials,
    }));

const makeUpcomingDeadlines = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks
    .filter((task) => task.dueDate && !['completed', 'archived'].includes(task.status))
    .map((task) => {
      const due = new Date(`${task.dueDate}T00:00:00`);
      return { ...task, daysLeft: Math.ceil((due - today) / 86400000) };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      taskTitle: task.title,
      assignedCount: task.totalAssigned,
      dueDate: task.dueDate,
      daysLeft: task.daysLeft,
    }));
};

function applyFilters(tasks, filters = {}) {
  let result = [...tasks];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        String(t.title || '').toLowerCase().includes(q) ||
        String(t.description || '').toLowerCase().includes(q) ||
        String(t.category || '').toLowerCase().includes(q) ||
        t.tags?.some((tag) => String(tag || '').toLowerCase().includes(q))
    );
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter((t) => {
      if (filters.status === 'active') return isActiveTask(t) && !['completed', 'overdue', 'pending-review'].includes(t.status);
      if (filters.status === 'archived') return t.status === 'archived';
      return t.status === filters.status;
    });
  } else {
    result = result.filter((t) => t.status !== 'archived');
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
    const tasks = await syncTaskStore();
    await delay(120);
    return {
      kpis: makeKpis(tasks),
      recentActivity: makeRecentActivity(tasks),
      upcomingDeadlines: makeUpcomingDeadlines(tasks),
    };
  },

  /**
   * Fetch paginated, filtered task list.
   * @param {object} filters - { search, status, priority, department, category, internId, page, pageSize }
   */
  fetchTasks: async (filters = {}) => {
    const allTasks = await syncTaskStore();
    await delay(120);
    const filtered = applyFilters(allTasks, filters);
    const sortFieldMap = { dueDate: 'dueDate', title: 'title', status: 'status', priority: 'priority', progress: 'completionPercentage' };
    const sortField = sortFieldMap[filters.sortField] || filters.sortField;
    if (sortField) {
      filtered.sort((a, b) => {
        const left = a[sortField] ?? '';
        const right = b[sortField] ?? '';
        const comparison = typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      tasks: paginated,
      allTasks,
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
   * Upload a task attachment using the real document service.
   * @param {File} file
   * @param {function} onProgress
   */
  uploadTaskAttachment: async (file, onProgress) => {
    const formatSize = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'Task Attachment');
      formData.append('title', file.name);
      formData.append('category', 'general');

      const response = await api.post('/documents/upload', formData, {
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) return;
          onProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      const uploaded = response.data?.data || response.data;
      if (onProgress) onProgress(100);

      return {
        id: uploaded?.id || `att-${Date.now()}`,
        name: uploaded?.name || uploaded?.displayName || file.name,
        size: formatSize(file.size),
        rawSize: file.size,
        type: file.type || 'application/octet-stream',
        url: uploaded?.filePath ? `/api/v1/documents/${uploaded.id}/download` : null,
        documentId: uploaded?.id || null,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err) {
      logWarn('Real document upload failed, using client attachment fallback:', err?.message);
    }

    if (onProgress) onProgress(100);
    return {
      id: `att-local-${Date.now()}`,
      name: file.name,
      size: formatSize(file.size),
      rawSize: file.size,
      type: file.type || 'application/octet-stream',
      url: typeof URL !== 'undefined' ? URL.createObjectURL(file) : null,
      uploadedAt: new Date().toISOString(),
    };
  },

  /**
   * Download or open a task attachment.
   * @param {object} attachment
   */
  downloadAttachment: async (attachment) => {
    if (attachment.documentId) {
      try {
        const res = await api.get(`/documents/${attachment.documentId}/download`);
        const downloadUrl = res.data?.data?.downloadUrl || res.data?.downloadUrl;
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
          return;
        }
      } catch (err) {
        logWarn('Could not fetch signed download URL:', err);
      }
    }
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  },

  /**
   * Create a new task.
   * @param {object} taskData
   */
  createTask: async (taskData) => {
    const isDraft = taskData.status === 'draft';
    const targetStatus = isDraft ? 'draft' : 'assigned';

    try {
      const response = await api.post('/tasks', {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: isDraft ? 'todo' : 'todo',
        due_date: taskData.dueDate || taskData.due_date,
        assignee_id: taskData.assignee_id || (taskData.assignedInterns && taskData.assignedInterns[0]?.id),
      });
      const created = response.data?.data || response.data;
      if (created) {
        const norm = normalizeTask({
          ...taskData,
          ...created,
          status: targetStatus,
          assignedInterns: taskData.assignedInterns?.length
            ? taskData.assignedInterns
            : (created.assignee_id ? [{ id: created.assignee_id, name: created.assignee_name || created.assignee_first_name }] : []),
          attachments: taskData.attachments || [],
          objectives: taskData.objectives || taskData.learningObjectives || [],
        });
        tasksStore = [norm, ...tasksStore];
        upsertLocalTask(norm);
        return { task: norm };
      }
    } catch {
      // Fallback to local mutation if API call fails
    }

    const newTask = normalizeTask({
      id: `task-${String(++nextId).padStart(3, '0')}`,
      ...taskData,
      status: targetStatus,
      createdDate: new Date().toISOString().split('T')[0],
      submissionCount: 0,
      completionPercentage: 0,
      assignedInterns: taskData.assignedInterns || [],
      attachments: taskData.attachments || [],
      objectives: taskData.objectives || taskData.learningObjectives || [],
    });
    tasksStore = [newTask, ...tasksStore];
    upsertLocalTask(newTask);
    return { task: newTask };
  },

  /**
   * Update an existing task.
   * @param {string} taskId
   * @param {object} updateData
   */
  updateTask: async (taskId, updateData) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, {
        title: updateData.title,
        description: updateData.description,
        priority: updateData.priority,
        status: updateData.status === 'assigned' ? 'todo' : updateData.status,
        due_date: updateData.dueDate || updateData.due_date,
      });
      const updated = response.data?.data || response.data;
      if (updated) {
        const existing = tasksStore.find((t) => String(t.id) === String(taskId)) || {};
        const norm = normalizeTask({
          ...existing,
          ...updateData,
          ...updated,
          status: updateData.status || existing.status,
          attachments: updateData.attachments || existing.attachments || [],
          objectives: updateData.objectives || updateData.learningObjectives || existing.objectives || [],
          assignedInterns: updateData.assignedInterns || existing.assignedInterns || [],
        });
        const index = tasksStore.findIndex((t) => String(t.id) === String(taskId));
        if (index !== -1) tasksStore[index] = norm;
        upsertLocalTask(norm);
        return { task: norm };
      }
    } catch {
      // Fallback
    }

    const index = tasksStore.findIndex((t) => String(t.id) === String(taskId));
    if (index === -1) throw new Error(`Task ${taskId} not found`);
    tasksStore[index] = normalizeTask({ ...tasksStore[index], ...updateData });
    upsertLocalTask(tasksStore[index]);
    return { task: tasksStore[index] };
  },

  /**
   * Delete a task by ID.
   * @param {string} taskId
   */
  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch {
      // Fallback
    }

    const before = tasksStore.length;
    tasksStore = tasksStore.filter((t) => String(t.id) !== String(taskId));
    markLocalDeleted(taskId);
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
    const duplicate = normalizeTask({
      ...JSON.parse(JSON.stringify(original)),
      id: `task-copy-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: original.status === 'archived' ? 'draft' : original.status,
      assignedInterns: original.assignedInterns || [],
      submissionCount: 0,
      completionPercentage: 0,
      createdDate: new Date().toISOString().split('T')[0],
    });
    tasksStore = [duplicate, ...tasksStore];
    upsertLocalTask(duplicate);
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
        markLocalDeleted(taskId);
        results.push({ taskId, success: true });
      } else if (actionData.action === 'status') {
        tasksStore[index] = { ...tasksStore[index], status: actionData.value };
        upsertLocalTask(tasksStore[index]);
        results.push({ taskId, success: true, task: tasksStore[index] });
      } else if (actionData.action === 'archive') {
        tasksStore[index] = { ...tasksStore[index], status: 'archived' };
        upsertLocalTask(tasksStore[index]);
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
    const tasks = await syncTaskStore();
    await delay(120);
    const derived = tasks
      .filter((task) => task.status !== 'archived' && task.status !== 'draft')
      .filter((task) => !taskId || task.id === taskId)
      .map((task) => {
        const intern = task.assignedInterns[0] || {};
        const submitted = ['pending-review', 'completed', 'needs-revision'].includes(task.status);
        const isLate = task.status === 'overdue' || (submitted && task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date());
        const status =
          task.status === 'completed' ? 'reviewed'
          : task.status === 'needs-revision' ? 'needs-revision'
          : task.status === 'pending-review' ? 'submitted'
          : task.status === 'overdue' ? 'late'
          : ['assigned', 'in-progress'].includes(task.status) ? 'pending'
          : 'not-started';

        return {
          id: `sub-${task.id}`,
          taskId: task.id,
          taskTitle: task.title,
          internName: intern.name || 'Unassigned intern',
          internInitials: intern.initials || 'IN',
          internAvatar: intern.avatar || null,
          status,
          attemptNumber: submitted ? Math.max(1, Number(task.submissionCount || 1)) : 0,
          submittedAt: submitted ? (task.updatedAt || task.createdDate || task.dueDate) : null,
          dueDate: task.dueDate,
          isLate,
          score: task.status === 'completed' ? (task.completionPercentage || 100) : null,
          progress: Number(task.completionPercentage || 0),
          estimatedHours: task.estimatedHours,
          assignedCount: task.totalAssigned || task.assignedInterns.length,
          submissionNote: submitted ? (task.submissionRequirements || task.description) : '',
          links: [],
          feedback: null,
          reviewedBy: null,
        };
      });
    const extras = (mockTaskSubmissions || []).filter((item) => !taskId || item.taskId === taskId);
    const byId = new Map(derived.map((item) => [item.id, item]));
    extras.forEach((item) => {
      if (!byId.has(item.id)) byId.set(item.id, item);
    });
    return { submissions: Array.from(byId.values()) };
  },

  /**
   * Fetch the activity timeline for a specific task.
   * @param {string} taskId
   */
  fetchTaskTimeline: async (taskId) => {
    await delay(250);
    return { timeline: getTaskTimeline(taskId) };
  },

  fetchTaskComments: async (taskId) => {
    await delay(80);
    const local = readLocalComments();
    const seeded = mockTaskComments[taskId] || [];
    const stored = local[taskId] || [];
    const byId = new Map();
    [...seeded, ...stored].forEach((comment) => byId.set(comment.id, comment));
    return { comments: Array.from(byId.values()).sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp))) };
  },

  addTaskComment: async (taskId, commentData = {}) => {
    await delay(150);
    const newComment = {
      id: `c-${taskId}-${Date.now()}`,
      authorName: commentData.authorName || 'Supervisor',
      authorRole: commentData.authorRole || 'Supervisor',
      avatar: commentData.avatar || null,
      timestamp: new Date().toISOString(),
      message: String(commentData.message || '').trim(),
    };
    const store = readLocalComments();
    store[taskId] = [...(store[taskId] || []), newComment];
    writeLocalComments(store);
    return { comment: newComment };
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
