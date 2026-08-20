/**
 * @file useDepartmentStore.js
 * @description Zustand store slice managing state for the Department Head Portal.
 */

import { create } from 'zustand';
import {
  fetchDepartmentDashboard,
  fetchDepartmentAnalytics,
  fetchDepartmentSupervisors,
  fetchDepartmentInterns,
  fetchDepartmentApprovals,
  fetchDepartmentAnnouncements,
  fetchDepartmentTasks,
  fetchDepartmentReviews,
  approveDepartmentRequest,
  rejectDepartmentRequest,
  createDepartmentAnnouncement,
  updateDepartmentAnnouncement,
  deleteDepartmentAnnouncement,
  togglePublishDepartmentAnnouncement,
} from '../services';

const initialFilters = {
  supervisorSearch: '',
  supervisorTrack: 'all',
  supervisorStatus: 'all',

  internSearch: '',
  internSupervisor: 'all',
  internStatus: 'all',
  internTrack: 'all',

  taskSearch: '',
  taskStatus: 'all',
  taskPriority: 'all',
  taskSupervisor: 'all',

  reviewSearch: '',
  reviewStatus: 'all',
  reviewSupervisor: 'all',

  approvalStatus: 'all',
  approvalType: 'all',
  approvalPriority: 'all',

  announcementCategory: 'all',
  announcementAudience: 'all',
};

export const useDepartmentStore = create((set, get) => ({
  // ── States ──────────────────────────────────────────────────────────────────
  dashboard: null,
  supervisors: [],
  interns: [],
  tasks: [],
  taskStats: null,
  reviews: [],
  reviewStats: null,
  analytics: null,
  approvals: [],
  announcements: [],

  filters: { ...initialFilters },

  loading: {
    dashboard: false,
    supervisors: false,
    interns: false,
    tasks: false,
    reviews: false,
    analytics: false,
    approvals: false,
    announcements: false,
    action: false,
  },

  errors: {
    dashboard: null,
    supervisors: null,
    interns: null,
    tasks: null,
    reviews: null,
    analytics: null,
    approvals: null,
    announcements: null,
  },

  selectedSupervisor: null,
  selectedIntern: null,
  selectedApproval: null,
  selectedAnnouncement: null,
  selectedTask: null,
  selectedReview: null,

  // ── Filters & Selection Actions ─────────────────────────────────────────────
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...initialFilters } }),

  setSelectedSupervisor: (supervisor) => set({ selectedSupervisor: supervisor }),
  setSelectedIntern: (intern) => set({ selectedIntern: intern }),
  setSelectedApproval: (approval) => set({ selectedApproval: approval }),
  setSelectedAnnouncement: (announcement) => set({ selectedAnnouncement: announcement }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setSelectedReview: (review) => set({ selectedReview: review }),

  // ── Fetch Actions ───────────────────────────────────────────────────────────
  fetchDashboard: async () => {
    set((state) => ({
      loading: { ...state.loading, dashboard: true },
      errors: { ...state.errors, dashboard: null },
    }));
    try {
      const data = await fetchDepartmentDashboard();
      set((state) => ({
        dashboard: data,
        loading: { ...state.loading, dashboard: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, dashboard: err.message || 'Failed to load dashboard' },
        loading: { ...state.loading, dashboard: false },
      }));
    }
  },

  fetchAnalytics: async () => {
    set((state) => ({
      loading: { ...state.loading, analytics: true },
      errors: { ...state.errors, analytics: null },
    }));
    try {
      const data = await fetchDepartmentAnalytics();
      set((state) => ({
        analytics: data,
        loading: { ...state.loading, analytics: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, analytics: err.message || 'Failed to load analytics' },
        loading: { ...state.loading, analytics: false },
      }));
    }
  },

  fetchSupervisors: async () => {
    set((state) => ({
      loading: { ...state.loading, supervisors: true },
      errors: { ...state.errors, supervisors: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentSupervisors({
        search: filters.supervisorSearch,
        track: filters.supervisorTrack,
        status: filters.supervisorStatus,
      });
      set((state) => ({
        supervisors: res.data,
        loading: { ...state.loading, supervisors: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, supervisors: err.message || 'Failed to load supervisors' },
        loading: { ...state.loading, supervisors: false },
      }));
    }
  },

  fetchInterns: async () => {
    set((state) => ({
      loading: { ...state.loading, interns: true },
      errors: { ...state.errors, interns: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentInterns({
        search: filters.internSearch,
        supervisorId: filters.internSupervisor,
        status: filters.internStatus,
        track: filters.internTrack,
      });
      set((state) => ({
        interns: res.data,
        loading: { ...state.loading, interns: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, interns: err.message || 'Failed to load interns' },
        loading: { ...state.loading, interns: false },
      }));
    }
  },

  fetchTasks: async () => {
    set((state) => ({
      loading: { ...state.loading, tasks: true },
      errors: { ...state.errors, tasks: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentTasks({
        search: filters.taskSearch,
        status: filters.taskStatus,
        priority: filters.taskPriority,
        supervisor: filters.taskSupervisor,
      });
      set((state) => ({
        tasks: res.data,
        taskStats: res.stats,
        loading: { ...state.loading, tasks: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, tasks: err.message || 'Failed to load tasks' },
        loading: { ...state.loading, tasks: false },
      }));
    }
  },

  fetchReviews: async () => {
    set((state) => ({
      loading: { ...state.loading, reviews: true },
      errors: { ...state.errors, reviews: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentReviews({
        search: filters.reviewSearch,
        status: filters.reviewStatus,
        supervisor: filters.reviewSupervisor,
      });
      set((state) => ({
        reviews: res.data,
        reviewStats: res.stats,
        loading: { ...state.loading, reviews: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, reviews: err.message || 'Failed to load reviews' },
        loading: { ...state.loading, reviews: false },
      }));
    }
  },

  fetchApprovals: async () => {
    set((state) => ({
      loading: { ...state.loading, approvals: true },
      errors: { ...state.errors, approvals: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentApprovals({
        status: filters.approvalStatus,
        type: filters.approvalType,
        priority: filters.approvalPriority,
      });
      set((state) => ({
        approvals: res.data,
        loading: { ...state.loading, approvals: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, approvals: err.message || 'Failed to load approvals' },
        loading: { ...state.loading, approvals: false },
      }));
    }
  },

  fetchAnnouncements: async () => {
    set((state) => ({
      loading: { ...state.loading, announcements: true },
      errors: { ...state.errors, announcements: null },
    }));
    try {
      const { filters } = get();
      const res = await fetchDepartmentAnnouncements({
        category: filters.announcementCategory,
        audience: filters.announcementAudience,
      });
      set((state) => ({
        announcements: res.data,
        loading: { ...state.loading, announcements: false },
      }));
    } catch (err) {
      set((state) => ({
        errors: { ...state.errors, announcements: err.message || 'Failed to load announcements' },
        loading: { ...state.loading, announcements: false },
      }));
    }
  },

  fetchAll: async () => {
    const { fetchDashboard, fetchSupervisors, fetchInterns, fetchApprovals, fetchAnnouncements } = get();
    await Promise.all([
      fetchDashboard(),
      fetchSupervisors(),
      fetchInterns(),
      fetchApprovals(),
      fetchAnnouncements(),
    ]);
  },

  // ── Approval Mutation Actions ────────────────────────────────────────────────
  approveRequest: async (requestId, comment = '') => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      const res = await approveDepartmentRequest(requestId, comment);
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === requestId
            ? {
                ...a,
                status: 'approved',
                reviewedBy: res.reviewedBy,
                reviewedAt: res.reviewedAt,
                reviewerComment: comment,
              }
            : a
        ),
        loading: { ...state.loading, action: false },
      }));
      return res;
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },

  rejectRequest: async (requestId, comment = '') => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      const res = await rejectDepartmentRequest(requestId, comment);
      set((state) => ({
        approvals: state.approvals.map((a) =>
          a.id === requestId
            ? {
                ...a,
                status: 'rejected',
                reviewedBy: res.reviewedBy,
                reviewedAt: res.reviewedAt,
                reviewerComment: comment,
              }
            : a
        ),
        loading: { ...state.loading, action: false },
      }));
      return res;
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },

  // ── Announcement Mutation Actions ─────────────────────────────────────────────
  createAnnouncement: async (announcementData) => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      const res = await createDepartmentAnnouncement(announcementData);
      set((state) => ({
        announcements: [res.data, ...state.announcements],
        loading: { ...state.loading, action: false },
      }));
      return res;
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },

  updateAnnouncement: async (id, announcementData) => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      await updateDepartmentAnnouncement(id, announcementData);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? { ...a, ...announcementData } : a
        ),
        loading: { ...state.loading, action: false },
      }));
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },

  deleteAnnouncement: async (id) => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      await deleteDepartmentAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
        loading: { ...state.loading, action: false },
      }));
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },

  togglePublishAnnouncement: async (id) => {
    set((state) => ({ loading: { ...state.loading, action: true } }));
    try {
      const current = get().announcements.find((a) => a.id === id);
      if (!current) return;
      const res = await togglePublishDepartmentAnnouncement(id, current.status);
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id ? { ...a, status: res.status } : a
        ),
        loading: { ...state.loading, action: false },
      }));
    } catch (err) {
      set((state) => ({ loading: { ...state.loading, action: false } }));
      throw err;
    }
  },
}));
