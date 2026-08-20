/**
 * @file useAnalyticsStore.js
 * @description Centralized Zustand store managing Reports & Analytics state.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { analyticsService } from '../services/analyticsService';


const DEFAULT_FILTERS = {
  dateRange: 'this_month',
  department: 'All Departments',
  batch: 'All Cohorts',
  supervisor: 'All Supervisors',
  intern: 'All Interns',
  taskStatus: 'All Statuses',
  reviewCycle: 'All Cycles',
  onboardingStatus: 'All Onboarding Statuses',
};

const DEFAULT_LAYOUT = [
  { id: 'kpis', title: 'Key Metrics Overview', visible: true, order: 0 },
  { id: 'insights', title: 'AI System Insights', visible: true, order: 1 },
  { id: 'reports', title: 'Summary Report Cards', visible: true, order: 2 },
  { id: 'charts', title: 'Charts & Performance Visualizations', visible: true, order: 3 },
  { id: 'heatmap', title: 'Activity Contribution Heatmap', visible: true, order: 4 },
];

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // Active Role Override for interactive previewing
      activeRole: null, // null defaults to logged-in user's role

      // Filters State
      filters: { ...DEFAULT_FILTERS },

      // Metrics & Data States
      metrics: null,
      summaryCards: null,
      filterOptions: null,
      chartData: null,
      savedReports: [],
      exportHistory: [],
      insights: [],

      // Widget Layout Config State
      dashboardLayout: DEFAULT_LAYOUT,

      // UI / Loading states
      isLoading: false,
      isExporting: false,
      exportProgress: 0,
      error: null,

      // ── Actions ─────────────────────────────────────────────────────────────

      setActiveRole: (role) => set({ activeRole: role }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

      // Load main dashboard payload
      loadAnalyticsData: async () => {
        set({ isLoading: true, error: null });
        try {
          const filters = get().filters;
          const [dashboardRes, chartsRes, reportsRes, insightsRes] = await Promise.all([
            analyticsService.getDashboardMetrics(filters),
            analyticsService.getChartData(filters),
            analyticsService.getSavedReports(),
            analyticsService.getAIInsights(filters),
          ]);

          set({
            metrics: dashboardRes.metrics,
            summaryCards: dashboardRes.summaryCards,
            filterOptions: dashboardRes.filterOptions,
            chartData: chartsRes,
            savedReports: reportsRes.savedReports,
            exportHistory: reportsRes.exportHistory,
            insights: insightsRes,
            isLoading: false,
          });
        } catch (err) {
          set({ error: err.message || 'Failed to load analytics data', isLoading: false });
          toast.error('Failed to update analytics');
        }
      },

      // Save a new report
      createSavedReport: async (reportConfig) => {
        try {
          const newReport = await analyticsService.saveReport(reportConfig);
          set((state) => ({
            savedReports: [newReport, ...state.savedReports],
          }));
          toast.success(`Saved "${newReport.title}"`);
          return newReport;
        } catch (err) {
          toast.error('Could not save report configuration.');
        }
      },

      // Duplicate report
      duplicateReport: (reportId) => {
        const target = get().savedReports.find((r) => r.id === reportId);
        if (!target) return;
        const duplicated = {
          ...target,
          id: `report-${Date.now()}`,
          title: `${target.title} (Copy)`,
          lastGenerated: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        set((state) => ({
          savedReports: [duplicated, ...state.savedReports],
        }));
        toast.success(`Duplicated "${target.title}"`);
      },

      // Rename report
      renameReport: (reportId, newTitle) => {
        set((state) => ({
          savedReports: state.savedReports.map((r) =>
            r.id === reportId ? { ...r, title: newTitle } : r,
          ),
        }));
        toast.success('Report renamed.');
      },

      // Delete report
      deleteReport: (reportId) => {
        set((state) => ({
          savedReports: state.savedReports.filter((r) => r.id !== reportId),
        }));
        toast.success('Report deleted.');
      },

      // Toggle favorite status
      toggleFavoriteReport: (reportId) => {
        set((state) => ({
          savedReports: state.savedReports.map((r) =>
            r.id === reportId ? { ...r, isFavorite: !r.isFavorite } : r,
          ),
        }));
      },

      // Export simulator
      runExport: async (exportConfig) => {
        set({ isExporting: true, exportProgress: 0 });
        try {
          const record = await analyticsService.generateExport(exportConfig, (progress) => {
            set({ exportProgress: progress });
          });
          set((state) => ({
            exportHistory: [record, ...state.exportHistory],
            isExporting: false,
            exportProgress: 0,
          }));
          toast.success(`Exported ${record.fileName} successfully!`);
          return record;
        } catch (err) {
          set({ isExporting: false, exportProgress: 0 });
          toast.error('Export failed.');
        }
      },

      // Layout management
      toggleWidgetVisibility: (widgetId) => {
        set((state) => ({
          dashboardLayout: state.dashboardLayout.map((w) =>
            w.id === widgetId ? { ...w, visible: !w.visible } : w,
          ),
        }));
      },

      moveWidget: (widgetId, direction) => {
        const layout = [...get().dashboardLayout];
        const idx = layout.findIndex((w) => w.id === widgetId);
        if (idx === -1) return;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= layout.length) return;

        // Swap
        const temp = layout[idx];
        layout[idx] = layout[targetIdx];
        layout[targetIdx] = temp;

        set({ dashboardLayout: layout });
      },

      resetDashboardLayout: () => set({ dashboardLayout: DEFAULT_LAYOUT }),
    }),
    {
      name: 'trakive_analytics_store',
      partialize: (state) => ({
        dashboardLayout: state.dashboardLayout,
        savedReports: state.savedReports,
        exportHistory: state.exportHistory,
      }),
    },
  ),
);
