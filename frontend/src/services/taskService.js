/**
 * @file taskService.js
 * @description Server-backed service layer for intern task management.
 */

import api from './api';

const normalizeTask = (raw = {}) => {
  if (!raw || typeof raw !== 'object') raw = {};
  const rawDue = raw.dueDate || raw.due_date;
  const dueDate = rawDue ? String(rawDue).slice(0, 10) : '';
  const statusMap = {
    todo: 'assigned',
    in_progress: 'in-progress',
    in_review: 'under-review',
    revision_requested: 'needs-revision',
  };
  const status = statusMap[raw.status] || raw.status || 'assigned';

  let remainingDays = 0;
  if (dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${dueDate}T00:00:00`);
    if (!Number.isNaN(due.getTime())) {
      remainingDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    }
  }

  let rawObjectives = raw.objectives;
  if (typeof rawObjectives === 'string') {
    try {
      rawObjectives = JSON.parse(rawObjectives);
    } catch {
      rawObjectives = [rawObjectives];
    }
  } else if (!Array.isArray(rawObjectives) && Array.isArray(raw.learningObjectives)) {
    rawObjectives = raw.learningObjectives;
  }

  const objectives = Array.isArray(rawObjectives)
    ? rawObjectives.filter(Boolean).map((objective, index) => {
        if (typeof objective === 'string') {
          return { id: `obj-${index + 1}`, text: objective, checked: false };
        }
        return {
          id: objective.id || `obj-${index + 1}`,
          text: objective.text || objective.name || objective.title || '',
          checked: Boolean(objective.checked || objective.completed || objective.is_completed),
        };
      })
    : [];

  return {
    ...raw,
    id: String(raw.id || raw.task_id || ''),
    title: raw.title || 'Untitled task',
    description: raw.description || '',
    category: raw.category || raw.project_title || raw.milestone_title || 'General',
    priority: String(raw.priority || 'medium').toLowerCase(),
    status,
    dueDate,
    remainingDays,
    progress: raw.progress ?? (status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0),
    objectives,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    submissions: Array.isArray(raw.submissions) ? raw.submissions : [],
  };
};

const responseData = (response) => response.data?.data ?? response.data;

export const taskService = {
  getTasks: async () => {
    const response = await api.get('/tasks', { params: { limit: 100 } });
    const items = responseData(response);
    return Array.isArray(items) ? items.map(normalizeTask) : [];
  },

  getTaskById: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return normalizeTask(responseData(response));
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return normalizeTask(responseData(response));
  },

  submitTaskDeliverable: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tasks/${taskId}/deliverables`, formData);
    return responseData(response);
  },
  getTaskComments: async () => {
    throw new Error('Task comments are not available from the server yet. No local data was saved.');
  },
  addTaskComment: async () => {
    throw new Error('Task comments are not available from the server yet. No local data was saved.');
  },
};

export default taskService;
