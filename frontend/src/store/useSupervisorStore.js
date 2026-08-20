/**
 * @file useSupervisorStore.js
 * @description Dedicated Zustand store managing state for the Supervisor Portal.
 * Handles dashboard metrics, intern overview, analytics, activities, deadlines, widgets, and filters.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supervisorService } from '../services/supervisorService';

export const useSupervisorStore = create(
  devtools(
    (set, get) => ({
      // ── Store State ─────────────────────────────────────────────────────────────
      kpis: [],
      interns: [],
      analytics: {
        performanceTrend: [],
        taskDistribution: [],
        reviewStatus: [],
        onboardingProgress: [],
      },
      activities: [],
      deadlines: [],
      widgets: {
        pendingApprovals: [],
        reviewReminders: [],
        recentlyAssigned: [],
        announcements: [],
        teamSummary: {},
      },

      // Filtering state
      searchTerm: '',
      departmentFilter: 'All',
      statusFilter: 'All',

      // Async status
      isLoading: false,
      isTableLoading: false,
      error: null,

      // ── Actions ─────────────────────────────────────────────────────────────────
      setSearchTerm: (term) => {
        set({ searchTerm: term });
        get().refreshInterns();
      },

      setDepartmentFilter: (dept) => {
        set({ departmentFilter: dept });
        get().refreshInterns();
      },

      setStatusFilter: (status) => {
        set({ statusFilter: status });
        get().refreshInterns();
      },

      resetFilters: () => {
        set({ searchTerm: '', departmentFilter: 'All', statusFilter: 'All' });
        get().refreshInterns();
      },

      /**
       * Fetch filtered intern list without reloading full dashboard
       */
      refreshInterns: async () => {
        const { searchTerm, departmentFilter, statusFilter } = get();
        set({ isTableLoading: true });
        try {
          const res = await supervisorService.fetchInterns({
            search: searchTerm,
            department: departmentFilter,
            status: statusFilter,
          });
          set({ interns: res.interns, isTableLoading: false });
        } catch (err) {
          set({ error: err.message, isTableLoading: false });
        }
      },

      /**
       * Load complete supervisor dashboard data concurrently
       */
      loadSupervisorDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const [
            dashboardRes,
            internsRes,
            analyticsRes,
            activityRes,
            deadlinesRes,
            widgetsRes,
          ] = await Promise.all([
            supervisorService.fetchDashboard(),
            supervisorService.fetchInterns({
              search: get().searchTerm,
              department: get().departmentFilter,
              status: get().statusFilter,
            }),
            supervisorService.fetchAnalytics(),
            supervisorService.fetchActivity(),
            supervisorService.fetchDeadlines(),
            supervisorService.fetchWidgets(),
          ]);

          set({
            kpis: dashboardRes.kpis,
            interns: internsRes.interns,
            analytics: analyticsRes,
            activities: activityRes.activities,
            deadlines: deadlinesRes.deadlines,
            widgets: widgetsRes,
            isLoading: false,
          });
        } catch (err) {
          set({ error: err.message || 'Failed to load supervisor dashboard', isLoading: false });
        }
      },
    }),
    { name: 'SupervisorStore' },
  ),
);

export default useSupervisorStore;
