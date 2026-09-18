/**
 * @file useDashboardStore.js
 * @description Zustand store for the intern dashboard, hydrated from live APIs.
 */

import { create } from 'zustand';
import { dashboardService } from '../services';

export const useDashboardStore = create((set, get) => ({
  stats: null,
  tasks: [],
  activities: [],
  notifications: [],
  progress: null,
  chartData: null,

  // Loading states
  loadingStats: false,
  loadingTasks: false,
  loadingActivities: false,
  loadingNotifications: false,
  loadingProgress: false,
  loadingCharts: false,

  // Error states
  error: null,

  // Action methods
  fetchStats: async () => {
    set({ loadingStats: true, error: null });
    try {
      const stats = await dashboardService.getStats();
      set({ stats, loadingStats: false });
    } catch (err) {
      set({ error: err.message, loadingStats: false });
    }
  },

  fetchTasks: async () => {
    set({ loadingTasks: true, error: null });
    try {
      const tasks = await dashboardService.getTasks();
      set({ tasks, loadingTasks: false });
    } catch (err) {
      set({ error: err.message, loadingTasks: false });
    }
  },

  fetchActivities: async () => {
    set({ loadingActivities: true, error: null });
    try {
      const activities = await dashboardService.getActivities();
      set({ activities, loadingActivities: false });
    } catch (err) {
      set({ error: err.message, loadingActivities: false });
    }
  },

  fetchNotifications: async () => {
    set({ loadingNotifications: true, error: null });
    try {
      const notifications = await dashboardService.getNotifications();
      set({ notifications, loadingNotifications: false });
    } catch (err) {
      set({ error: err.message, loadingNotifications: false });
    }
  },

  fetchProgress: async () => {
    set({ loadingProgress: true, error: null });
    try {
      const progress = await dashboardService.getProgress();
      set({ progress, loadingProgress: false });
    } catch (err) {
      set({ error: err.message, loadingProgress: false });
    }
  },

  fetchChartData: async () => {
    set({ loadingCharts: true, error: null });
    try {
      const chartData = await dashboardService.getChartData();
      set({ chartData, loadingCharts: false });
    } catch (err) {
      set({ error: err.message, loadingCharts: false });
    }
  },

  fetchAllDashboardData: async () => {
    set({
      loadingStats: true,
      loadingTasks: true,
      loadingActivities: true,
      loadingNotifications: true,
      loadingProgress: true,
      loadingCharts: true,
      error: null,
    });
    try {
      const snapshot = await dashboardService.getDashboard();
      set({
        stats: snapshot.stats,
        tasks: snapshot.tasks,
        activities: snapshot.activities,
        notifications: snapshot.notifications,
        progress: snapshot.progress,
        chartData: snapshot.chartData,
        loadingStats: false,
        loadingTasks: false,
        loadingActivities: false,
        loadingNotifications: false,
        loadingProgress: false,
        loadingCharts: false,
      });
    } catch (err) {
      set({
        error: err.message,
        loadingStats: false,
        loadingTasks: false,
        loadingActivities: false,
        loadingNotifications: false,
        loadingProgress: false,
        loadingCharts: false,
      });
    }
  },

  // Mark a notification as read locally
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      )
    }));
  },

  // Mark all notifications as read
  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, unread: false }))
    }));
  },

  // Helper selectors
  getUnreadNotificationsCount: () => {
    return get().notifications.filter((n) => n.unread).length;
  }
}));
