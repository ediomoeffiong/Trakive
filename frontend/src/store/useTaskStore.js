import { create } from 'zustand';
import { taskService } from '../services';
import { useNotificationStore } from './useNotificationStore';

const initialFilters = {
  searchQuery: '',
  status: 'all',
  priority: 'all',
  category: 'all',
};

const initialSort = {
  sortBy: 'dueDate', // dueDate, newest, oldest, priority, alphabetical, status
  sortOrder: 'asc',
};

export const useTaskStore = create((set, get) => ({
  // State
  tasks: [],
  currentTask: null,
  filters: { ...initialFilters },
  sort: { ...initialSort },

  // Loading States
  loadingTasks: false,
  loadingTaskDetails: false,
  updatingStatus: false,
  submittingDeliverable: false,
  loadingComments: false,
  addingComment: false,

  // Errors
  error: null,

  // Setters
  setFilter: (name, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [name]: value,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, sort: { ...initialSort } });
  },

  setSort: (sortBy, sortOrder = 'asc') => {
    set({ sort: { sortBy, sortOrder } });
  },

  // Actions
  fetchTasks: async () => {
    set({ loadingTasks: true, error: null });
    try {
      const tasks = await taskService.getTasks();
      set({ tasks, loadingTasks: false });
    } catch (err) {
      set({ error: err.message, loadingTasks: false });
    }
  },

  fetchTaskDetails: async (taskId) => {
    set({ loadingTaskDetails: true, error: null });
    try {
      const task = await taskService.getTaskById(taskId);
      set({ currentTask: task, loadingTaskDetails: false });
    } catch (err) {
      set({ error: err.message, loadingTaskDetails: false });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    set({ updatingStatus: true, error: null });
    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, status);
      
      // Update tasks array and current task if it matches
      set((state) => {
        const newTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t));
        const newCurrentTask =
          state.currentTask && state.currentTask.id === taskId
            ? { ...state.currentTask, ...updatedTask }
            : state.currentTask;

        return {
          tasks: newTasks,
          currentTask: newCurrentTask,
          updatingStatus: false,
        };
      });

      // Dispatch notification
      useNotificationStore.getState().addNotification({
        category: status === 'completed' ? 'task_completed' : 'task_updated',
        title: status === 'completed' ? 'Task Completed' : 'Task Status Updated',
        shortDescription: `Task status changed to ${status}.`,
        message: `Task '${updatedTask?.title || 'Task'}' status has been updated to '${status}'.`,
        actionLabel: 'View Task',
        actionRoute: `/dashboard/tasks/${taskId}`,
      });
    } catch (err) {
      set({ error: err.message, updatingStatus: false });
    }
  },

  submitDeliverable: async (taskId, fileMetadata) => {
    set({ submittingDeliverable: true, error: null });
    try {
      const newSubmission = await taskService.submitTaskDeliverable(taskId, fileMetadata);
      
      // Add submission locally and transition task status
      set((state) => {
        const updatedSubmissions = state.currentTask?.submissions
          ? [newSubmission, ...state.currentTask.submissions]
          : [newSubmission];

        const updatedTask = {
          ...state.currentTask,
          status: 'under-review',
          submissions: updatedSubmissions,
        };

        const updatedTasksList = state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'under-review' } : t
        );

        return {
          currentTask: updatedTask,
          tasks: updatedTasksList,
          submittingDeliverable: false,
        };
      });

      // Dispatch notification
      useNotificationStore.getState().addNotification({
        category: 'task_submitted',
        title: 'Task Deliverable Submitted',
        shortDescription: 'Your deliverable was submitted for supervisor review.',
        message: `Deliverable '${fileMetadata.name || 'file'}' was submitted. Your mentor will review and provide feedback.`,
        actionLabel: 'View Deliverable',
        actionRoute: `/dashboard/tasks/${taskId}`,
      });
    } catch (err) {
      set({ error: err.message, submittingDeliverable: false });
      throw err;
    }
  },

  addComment: async (taskId, message) => {
    set({ addingComment: true, error: null });
    try {
      const newComment = await taskService.addTaskComment(taskId, { message });
      
      set((state) => {
        const updatedComments = state.currentTask?.comments
          ? [...state.currentTask.comments, newComment]
          : [newComment];

        return {
          currentTask: state.currentTask
            ? { ...state.currentTask, comments: updatedComments }
            : null,
          addingComment: false,
        };
      });

      // Dispatch notification
      useNotificationStore.getState().addNotification({
        category: 'task_comment',
        title: 'New Comment Posted',
        shortDescription: 'Comment added to task discussion.',
        message: `New comment posted: "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
        actionLabel: 'View Discussion',
        actionRoute: `/dashboard/tasks/${taskId}`,
      });
    } catch (err) {
      set({ error: err.message, addingComment: false });
    }
  },
}));

// Helper logic for filtering & sorting tasks
export const getFilteredAndSortedTasks = (state = {}) => {
  const { tasks, filters = {}, sort = {} } = state;
  const safeTasks = Array.isArray(tasks) ? tasks.filter(Boolean) : [];

  // 1. Filter
  let result = safeTasks.filter((task) => {
    if (!task) return false;
    // Search
    if (filters.searchQuery) {
      const query = String(filters.searchQuery).toLowerCase();
      const matchTitle = String(task.title || '').toLowerCase().includes(query);
      const matchDesc = String(task.description || '').toLowerCase().includes(query);
      const matchCat = String(task.category || '').toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Status
    if (filters.status && filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority
    if (filters.priority && filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Category
    if (filters.category && filters.category !== 'all' && task.category !== filters.category) {
      return false;
    }

    return true;
  });

  // 2. Sort
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const statusWeight = {
    'needs-revision': 6,
    'under-review': 5,
    'in-progress': 4,
    'assigned': 3,
    'completed': 2,
  };

  const getSortTime = (val, fallback = '2026-07-10') => {
    if (!val) val = fallback;
    const t = new Date(val).getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  result.sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    let valA, valB;

    switch (sort.sortBy) {
      case 'dueDate':
        valA = getSortTime(a.dueDate, '9999-12-31');
        valB = getSortTime(b.dueDate, '9999-12-31');
        break;
      case 'newest':
        valA = getSortTime(b.assignedDate || b.created_at || b.createdAt);
        valB = getSortTime(a.assignedDate || a.created_at || a.createdAt);
        break;
      case 'oldest':
        valA = getSortTime(a.assignedDate || a.created_at || a.createdAt);
        valB = getSortTime(b.assignedDate || b.created_at || b.createdAt);
        break;
      case 'priority':
        valA = priorityWeight[a.priority] || 0;
        valB = priorityWeight[b.priority] || 0;
        break;
      case 'alphabetical':
        return sort.sortOrder === 'asc'
          ? String(a.title || '').localeCompare(String(b.title || ''))
          : String(b.title || '').localeCompare(String(a.title || ''));
      case 'status':
        valA = statusWeight[a.status] || 0;
        valB = statusWeight[b.status] || 0;
        break;
      default:
        valA = 0;
        valB = 0;
    }

    if (valA < valB) return sort.sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sort.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
};
