/**
 * @file useSupervisorTaskStore.js
 * @description Dedicated Zustand store for the Supervisor Task & Assignment Management module.
 * Manages tasks, templates, submissions, calendar, filters, pagination, multi-select,
 * modal/drawer state, and async loading states.
 *
 * Architecture note: All async calls are isolated in taskManagementService.js.
 * Swapping mock services for real API calls requires only changes in that file.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskManagementService } from '../services/taskManagementService';

const initialFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  department: 'all',
  category: 'all',
  internId: 'all',
  tags: [],
};

export const useSupervisorTaskStore = create(
  devtools(
    (set, get) => ({
      // ── Task List State ─────────────────────────────────────────────────────
      tasks: [],
      totalTasks: 0,
      totalPages: 1,

      // ── Selected / Active Task ──────────────────────────────────────────────
      selectedTask: null,

      // ── Template State ─────────────────────────────────────────────────────
      templates: [],

      // ── Submission State ──────────────────────────────────────────────────
      submissions: [],
      activeSubmissionTaskId: null,

      // ── Timeline State ────────────────────────────────────────────────────
      taskTimeline: [],

      // ── Dashboard Metrics ─────────────────────────────────────────────────
      kpis: [],
      recentActivity: [],
      upcomingDeadlines: [],

      // ── Calendar State ────────────────────────────────────────────────────
      calendarViewMode: 'month', // 'month' | 'week' | 'agenda'
      calendarDate: new Date().toISOString().split('T')[0],

      // ── Filter & Search State ─────────────────────────────────────────────
      filters: { ...initialFilters },
      activeFilterChips: [],
      activeSort: { field: 'dueDate', order: 'asc' },

      // ── Pagination ────────────────────────────────────────────────────────
      currentPage: 1,
      pageSize: 10,

      // ── Multi-Select (Bulk Actions) ───────────────────────────────────────
      selectedTaskIds: [],

      // ── Active Tab ─────────────────────────────────────────────────────────
      activeTab: 'dashboard', // 'dashboard' | 'directory' | 'submissions' | 'calendar' | 'templates'

      // ── UI Modal / Drawer Controls ────────────────────────────────────────
      isCreateModalOpen: false,
      isDetailsDrawerOpen: false,
      isAssignModalOpen: false,
      isTemplatesModalOpen: false,
      editingTask: null, // null = create, object = edit

      // ── Async Loading States ──────────────────────────────────────────────
      loading: {
        dashboard: false,
        tasks: false,
        taskDetails: false,
        templates: false,
        submissions: false,
        timeline: false,
        action: false,   // create/update/delete/duplicate
      },

      // ── Errors ────────────────────────────────────────────────────────────
      errors: {
        dashboard: null,
        tasks: null,
        taskDetails: null,
        templates: null,
        submissions: null,
        action: null,
      },

      // ══════════════════════════════════════════════════════════════════════
      // ── ACTIONS ───────────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      // ── Tab navigation ────────────────────────────────────────────────────
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ── Calendar ─────────────────────────────────────────────────────────
      setCalendarView: (mode) => set({ calendarViewMode: mode }),
      setCalendarDate: (date) => set({ calendarDate: date }),

      // ── Filters ──────────────────────────────────────────────────────────
      setFilter: (key, value) => {
        set((state) => {
          const newFilters = { ...state.filters, [key]: value };
          const chips = buildFilterChips(newFilters);
          return { filters: newFilters, activeFilterChips: chips, currentPage: 1 };
        });
        get().fetchTasks();
      },

      setSearch: (search) => {
        set((state) => {
          const newFilters = { ...state.filters, search };
          const chips = buildFilterChips(newFilters);
          return { filters: newFilters, activeFilterChips: chips, currentPage: 1 };
        });
        get().fetchTasks();
      },

      removeFilterChip: (key) => {
        get().setFilter(key, key === 'tags' ? [] : 'all');
      },

      clearAllFilters: () => {
        set({ filters: { ...initialFilters }, activeFilterChips: [], currentPage: 1 });
        get().fetchTasks();
      },

      setSort: (field, order) => {
        set({ activeSort: { field, order } });
        get().fetchTasks();
      },

      // ── Pagination ────────────────────────────────────────────────────────
      setPage: (page) => {
        set({ currentPage: page });
        get().fetchTasks();
      },

      // ── Multi-Select (Bulk) ───────────────────────────────────────────────
      toggleSelectTask: (taskId) => {
        set((state) => ({
          selectedTaskIds: state.selectedTaskIds.includes(taskId)
            ? state.selectedTaskIds.filter((id) => id !== taskId)
            : [...state.selectedTaskIds, taskId],
        }));
      },

      selectAllTasks: () => {
        set((state) => ({
          selectedTaskIds: state.tasks.map((t) => t.id),
        }));
      },

      clearSelection: () => set({ selectedTaskIds: [] }),

      // ── Modal / Drawer Controls ───────────────────────────────────────────
      openCreateModal: (editTask = null) =>
        set({ isCreateModalOpen: true, editingTask: editTask }),

      closeCreateModal: () =>
        set({ isCreateModalOpen: false, editingTask: null }),

      openDetailsDrawer: (task) =>
        set({ isDetailsDrawerOpen: true, selectedTask: task }),

      closeDetailsDrawer: () =>
        set({ isDetailsDrawerOpen: false, selectedTask: null, taskTimeline: [] }),

      openAssignModal: (task = null) => {
        if (task) set({ selectedTask: task });
        set({ isAssignModalOpen: true });
      },

      closeAssignModal: () => set({ isAssignModalOpen: false }),

      openTemplatesModal: () => {
        set({ isTemplatesModalOpen: true });
        get().fetchTemplates();
      },

      closeTemplatesModal: () => set({ isTemplatesModalOpen: false }),

      // ══════════════════════════════════════════════════════════════════════
      // ── ASYNC ACTIONS ─────────────────────────────────────────────────────
      // ══════════════════════════════════════════════════════════════════════

      /**
       * Load the task management dashboard (KPIs, activity, deadlines).
       */
      loadDashboard: async () => {
        set((s) => ({ loading: { ...s.loading, dashboard: true }, errors: { ...s.errors, dashboard: null } }));
        try {
          const res = await taskManagementService.fetchDashboardMetrics();
          set((s) => ({
            kpis: res.kpis,
            recentActivity: res.recentActivity,
            upcomingDeadlines: res.upcomingDeadlines,
            loading: { ...s.loading, dashboard: false },
          }));
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, dashboard: false }, errors: { ...s.errors, dashboard: err.message || 'Failed to load dashboard' } }));
        }
      },

      /**
       * Fetch the task list applying current filters, sort, and pagination.
       */
      fetchTasks: async () => {
        const { filters, currentPage, pageSize, activeSort } = get();
        set((s) => ({ loading: { ...s.loading, tasks: true }, errors: { ...s.errors, tasks: null } }));
        try {
          const res = await taskManagementService.fetchTasks({
            ...filters,
            page: currentPage,
            pageSize,
            sortField: activeSort.field,
            sortOrder: activeSort.order,
          });
          set((s) => ({
            tasks: res.tasks,
            totalTasks: res.total,
            totalPages: res.totalPages,
            loading: { ...s.loading, tasks: false },
          }));
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, tasks: false }, errors: { ...s.errors, tasks: err.message || 'Failed to load tasks' } }));
        }
      },

      /**
       * Create a new task (or save as draft).
       */
      createTask: async (taskData) => {
        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          const res = await taskManagementService.createTask(taskData);
          set((s) => ({
            tasks: [res.task, ...s.tasks],
            totalTasks: s.totalTasks + 1,
            loading: { ...s.loading, action: false },
            isCreateModalOpen: false,
            editingTask: null,
          }));
          return res.task;
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message || 'Failed to create task' } }));
          throw err;
        }
      },

      /**
       * Update an existing task.
       */
      updateTask: async (taskId, updateData) => {
        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          const res = await taskManagementService.updateTask(taskId, updateData);
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === taskId ? res.task : t)),
            selectedTask: s.selectedTask?.id === taskId ? res.task : s.selectedTask,
            loading: { ...s.loading, action: false },
            isCreateModalOpen: false,
            editingTask: null,
          }));
          return res.task;
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message || 'Failed to update task' } }));
          throw err;
        }
      },

      /**
       * Delete a task.
       */
      deleteTask: async (taskId) => {
        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          await taskManagementService.deleteTask(taskId);
          set((s) => ({
            tasks: s.tasks.filter((t) => t.id !== taskId),
            totalTasks: s.totalTasks - 1,
            selectedTaskIds: s.selectedTaskIds.filter((id) => id !== taskId),
            loading: { ...s.loading, action: false },
          }));
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message || 'Failed to delete task' } }));
          throw err;
        }
      },

      /**
       * Duplicate a task.
       */
      duplicateTask: async (taskId) => {
        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          const res = await taskManagementService.duplicateTask(taskId);
          set((s) => ({
            tasks: [res.task, ...s.tasks],
            totalTasks: s.totalTasks + 1,
            loading: { ...s.loading, action: false },
          }));
          return res.task;
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message || 'Failed to duplicate task' } }));
          throw err;
        }
      },

      /**
       * Perform bulk action on selected tasks.
       */
      bulkAction: async (action, value = null) => {
        const { selectedTaskIds } = get();
        if (selectedTaskIds.length === 0) return;

        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          await taskManagementService.bulkUpdateTasks(selectedTaskIds, { action, value });

          // Update local state
          if (action === 'delete') {
            set((s) => ({
              tasks: s.tasks.filter((t) => !selectedTaskIds.includes(t.id)),
              totalTasks: s.totalTasks - selectedTaskIds.length,
              selectedTaskIds: [],
              loading: { ...s.loading, action: false },
            }));
          } else if (action === 'status') {
            set((s) => ({
              tasks: s.tasks.map((t) =>
                selectedTaskIds.includes(t.id) ? { ...t, status: value } : t
              ),
              selectedTaskIds: [],
              loading: { ...s.loading, action: false },
            }));
          } else if (action === 'archive') {
            set((s) => ({
              tasks: s.tasks.map((t) =>
                selectedTaskIds.includes(t.id) ? { ...t, status: 'archived' } : t
              ),
              selectedTaskIds: [],
              loading: { ...s.loading, action: false },
            }));
          } else {
            set((s) => ({
              selectedTaskIds: [],
              loading: { ...s.loading, action: false },
            }));
          }
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message || 'Bulk action failed' } }));
          throw err;
        }
      },

      /**
       * Fetch task templates.
       */
      fetchTemplates: async () => {
        set((s) => ({ loading: { ...s.loading, templates: true }, errors: { ...s.errors, templates: null } }));
        try {
          const res = await taskManagementService.fetchTemplates();
          set((s) => ({ templates: res.templates, loading: { ...s.loading, templates: false } }));
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, templates: false }, errors: { ...s.errors, templates: err.message } }));
        }
      },

      /**
       * Delete a template.
       */
      deleteTemplate: async (templateId) => {
        await taskManagementService.deleteTemplate(templateId);
        set((s) => ({ templates: s.templates.filter((t) => t.id !== templateId) }));
      },

      /**
       * Fetch submissions for a task (or all submissions).
       */
      fetchSubmissions: async (taskId = null) => {
        set((s) => ({ loading: { ...s.loading, submissions: true }, errors: { ...s.errors, submissions: null } }));
        try {
          const res = await taskManagementService.fetchSubmissions(taskId);
          set((s) => ({
            submissions: res.submissions,
            activeSubmissionTaskId: taskId,
            loading: { ...s.loading, submissions: false },
          }));
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, submissions: false }, errors: { ...s.errors, submissions: err.message } }));
        }
      },

      /**
       * Fetch timeline events for a task.
       */
      fetchTaskTimeline: async (taskId) => {
        set((s) => ({ loading: { ...s.loading, timeline: true } }));
        try {
          const res = await taskManagementService.fetchTaskTimeline(taskId);
          set((s) => ({ taskTimeline: res.timeline, loading: { ...s.loading, timeline: false } }));
        } catch {
          set((s) => ({ loading: { ...s.loading, timeline: false } }));
        }
      },

      /**
       * Assign a task to interns.
       */
      assignTask: async (assignmentPayload) => {
        set((s) => ({ loading: { ...s.loading, action: true }, errors: { ...s.errors, action: null } }));
        try {
          const res = await taskManagementService.assignTask(assignmentPayload);
          // Optimistically update task status if was draft
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === assignmentPayload.taskId && t.status === 'draft'
                ? { ...t, status: 'assigned' }
                : t
            ),
            loading: { ...s.loading, action: false },
            isAssignModalOpen: false,
          }));
          return res;
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, action: false }, errors: { ...s.errors, action: err.message } }));
          throw err;
        }
      },
    }),
    { name: 'SupervisorTaskStore' }
  )
);

// ── Helper: Build active filter chips from current filter state ───────────────
function buildFilterChips(filters) {
  const chips = [];
  const labels = {
    status: 'Status',
    priority: 'Priority',
    department: 'Department',
    category: 'Category',
    internId: 'Intern',
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'search' || key === 'tags') return;
    if (value && value !== 'all') {
      chips.push({ key, label: labels[key] || key, value });
    }
  });

  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => chips.push({ key: 'tags', label: 'Tag', value: tag }));
  }

  return chips;
}

export default useSupervisorTaskStore;
