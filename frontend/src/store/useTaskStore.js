/**
 * @file useTaskStore.js
 * @description Zustand store for managing task states, details, filtering, sorting, uploads, and comments.
 */

import { create } from 'zustand';
import { taskService } from '../services';

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
    } catch (err) {
      set({ error: err.message, addingComment: false });
    }
  },
}));

// Helper logic for filtering & sorting tasks
export const getFilteredAndSortedTasks = (state) => {
  const { tasks, filters, sort } = state;

  // 1. Filter
  let result = tasks.filter((task) => {
    // Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      const matchCat = task.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    // Status
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Priority
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Category
    if (filters.category !== 'all' && task.category !== filters.category) {
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

  result.sort((a, b) => {
    let valA, valB;

    switch (sort.sortBy) {
      case 'dueDate':
        valA = new Date(a.dueDate).getTime();
        valB = new Date(b.dueDate).getTime();
        break;
      case 'newest':
        // Mock assigned date or ID
        valA = new Date(b.assignedDate || '2026-07-10').getTime();
        valB = new Date(a.assignedDate || '2026-07-10').getTime();
        break;
      case 'oldest':
        valA = new Date(a.assignedDate || '2026-07-10').getTime();
        valB = new Date(b.assignedDate || '2026-07-10').getTime();
        break;
      case 'priority':
        valA = priorityWeight[a.priority] || 0;
        valB = priorityWeight[b.priority] || 0;
        break;
      case 'alphabetical':
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
        break;
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
