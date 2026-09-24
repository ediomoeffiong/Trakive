/**
 * @file taskService.js
 * @description Real API service layer with fallbacks for Intern task management.
 */

import api from './api';
import { mockTasks, mockTaskComments, mockSubmissions, mockAttachments } from '../data';
import { useAppStore } from '../store/useAppStore';

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@thefifthlab.com', 'supervisor@thefifthlab.com', 'hr@thefifthlab.com', 'head@thefifthlab.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

const normalizeTask = (raw = {}) => {
  if (!raw || typeof raw !== 'object') raw = {};
  const rawDue = raw.dueDate || raw.due_date;
  const dueDate = rawDue ? String(rawDue).slice(0, 10) : '';
  const status = raw.status === 'todo' ? 'assigned' : (raw.status || 'assigned');

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
    ? rawObjectives.filter(Boolean).map((obj, idx) => {
        if (typeof obj === 'string') {
          return { id: `obj-${idx + 1}`, text: obj, checked: false };
        }
        if (obj && typeof obj === 'object') {
          return {
            id: obj.id || `obj-${idx + 1}`,
            text: obj.text || obj.name || obj.title || '',
            checked: Boolean(obj.checked || obj.completed || obj.is_completed),
          };
        }
        return { id: `obj-${idx + 1}`, text: String(obj || ''), checked: false };
      })
    : [];

  return {
    ...raw,
    id: String(raw.id || raw.task_id || `task-${Math.random().toString(36).slice(2)}`),
    title: raw.title || 'Untitled task',
    description: raw.description || '',
    category: raw.category || raw.project_title || raw.milestone_title || 'General',
    priority: String(raw.priority || 'medium').toLowerCase(),
    status,
    dueDate,
    remainingDays,
    progress: raw.progress ?? (status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0),
    objectives,
  };
};

export const taskService = {
  /**
   * Fetch all tasks from backend API.
   */
  getTasks: async () => {
    try {
      const response = await api.get('/tasks', { params: { limit: 100 } });
      const items = response.data?.data || response.data?.items || (Array.isArray(response.data) ? response.data : []);
      if (Array.isArray(items)) {
        return items.map(normalizeTask);
      }
    } catch (err) {
      if (!isDemoUser()) {
        const user = useAppStore.getState()?.user;
        const key = `trakive_user_tasks_${user?.id || 'new'}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            return JSON.parse(saved).map(normalizeTask);
          } catch {
            // ignore
          }
        }
      }
    }

    if (isDemoUser()) {
      return JSON.parse(JSON.stringify(mockTasks)).map(normalizeTask);
    }

    return [];
  },

  /**
   * Fetch task details by ID.
   */
  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      const data = response.data?.data || response.data;
      if (data) {
        return normalizeTask(data);
      }
    } catch (err) {
      // Fallback to local mock data if offline or demo
    }

    const tasks = JSON.parse(JSON.stringify(mockTasks));
    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found.`);
    }

    task.attachments = JSON.parse(JSON.stringify(mockAttachments[taskId] || []));
    task.comments = JSON.parse(JSON.stringify(mockTaskComments[taskId] || []));
    task.submissions = JSON.parse(JSON.stringify(mockSubmissions[taskId] || []));

    return normalizeTask(task);
  },

  /**
   * Update task status.
   */
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      const updated = response.data?.data || response.data;
      if (updated) return normalizeTask(updated);
    } catch (err) {
      // Fallback for offline/demo
    }

    const taskIdx = mockTasks.findIndex((t) => String(t.id) === String(taskId));
    if (taskIdx !== -1) {
      mockTasks[taskIdx].status = status;
      if (status === 'completed') {
        mockTasks[taskIdx].progress = 100;
        mockTasks[taskIdx].completedAt = new Date().toISOString().split('T')[0];
      }
      return normalizeTask(mockTasks[taskIdx]);
    }

    return { id: taskId, status };
  },

  /**
   * Upload a deliverable submission.
   */
  submitTaskDeliverable: async (taskId, fileMetadata) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: 'submitted' });
    } catch {
      // ignore
    }

    const newSubmission = {
      id: `sub-${taskId}-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fileName: fileMetadata.name,
      fileSize: fileMetadata.size,
      status: 'under-review',
      feedback: null,
      feedbackAuthor: null,
      feedbackDate: null,
    };

    if (!mockSubmissions[taskId]) {
      mockSubmissions[taskId] = [];
    }
    mockSubmissions[taskId].unshift(newSubmission);

    return newSubmission;
  },

  /**
   * Fetch comments for a task.
   */
  getTaskComments: async (taskId) => {
    return JSON.parse(JSON.stringify(mockTaskComments[taskId] || []));
  },

  /**
   * Add a new comment to a task.
   */
  addTaskComment: async (taskId, commentData) => {
    if (!mockTaskComments[taskId]) {
      mockTaskComments[taskId] = [];
    }

    const newComment = {
      id: `c-${taskId}-${Date.now()}`,
      authorName: commentData.authorName || 'Intern User',
      authorRole: commentData.authorRole || 'Intern',
      avatar: commentData.avatar || null,
      timestamp: new Date().toISOString(),
      message: commentData.message,
    };

    mockTaskComments[taskId].push(newComment);
    return newComment;
  },
};

export default taskService;
