/**
 * @file useNotificationStore.js
 * @description Dedicated Zustand store for Trakive's Notifications & Communication Center.
 *
 * Architecture note: All service calls go through notificationService so that
 * switching from mock to real API / WebSocket requires only updating that service file.
 */

import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { notificationService } from '../services';

export const useNotificationStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  notifications: [],
  announcements: [],
  reminders: [],
  preferences: null,

  // Filters
  filters: {
    category: 'all',  // 'all' | category key
    status: 'all',    // 'all' | 'read' | 'unread'
    dateRange: null,  // null | 'today' | 'yesterday' | 'week' | 'older'
  },
  searchQuery: '',

  // UI state
  drawerOpen: false,          // Topbar notification drawer
  selectedNotification: null, // Notification opened in detail panel
  preferencesOpen: false,     // Preferences modal

  // Loading states
  loadingNotifications: false,
  loadingAnnouncements: false,
  loadingReminders: false,
  loadingPreferences: false,

  // Error
  error: null,

  // Simulated real-time cleanup ref
  _simulationCleanup: null,

  // ── Data Fetching ──────────────────────────────────────────────────────────

  fetchNotifications: async (role) => {
    set({ loadingNotifications: true, error: null });
    try {
      const notifications = await notificationService.getNotifications(role);
      set({ notifications, loadingNotifications: false });
    } catch (err) {
      set({ error: err.message, loadingNotifications: false });
    }
  },

  fetchAnnouncements: async (role) => {
    set({ loadingAnnouncements: true, error: null });
    try {
      const announcements = await notificationService.getAnnouncements(role);
      set({ announcements, loadingAnnouncements: false });
    } catch (err) {
      set({ error: err.message, loadingAnnouncements: false });
    }
  },

  fetchReminders: async (role) => {
    set({ loadingReminders: true, error: null });
    try {
      const reminders = await notificationService.getReminders(role);
      set({ reminders, loadingReminders: false });
    } catch (err) {
      set({ error: err.message, loadingReminders: false });
    }
  },

  fetchPreferences: async (role) => {
    set({ loadingPreferences: true });
    try {
      const preferences = await notificationService.getPreferences(role);
      set({ preferences, loadingPreferences: false });
    } catch (err) {
      set({ error: err.message, loadingPreferences: false });
    }
  },

  fetchAll: async (role) => {
    const store = get();
    await Promise.all([
      store.fetchNotifications(role),
      store.fetchAnnouncements(role),
      store.fetchReminders(role),
      store.fetchPreferences(role),
    ]);
  },

  // ── CRUD Actions ───────────────────────────────────────────────────────────

  addNotification: async (data, role) => {
    try {
      const created = await notificationService.createNotification(data, role);
      set((state) => ({
        notifications: [created, ...state.notifications],
      }));
      toast(created.title, {
        icon: '🔔',
        style: {
          borderLeft: '4px solid #6366f1',
        },
      });
      return created;
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  },

  markAsRead: async (id, role) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
    try {
      await notificationService.markAsRead(id, role);
    } catch {
      // Rollback on failure
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: false } : n
        ),
      }));
    }
  },

  markAsUnread: async (id, role) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: false } : n
      ),
    }));
    try {
      await notificationService.markAsUnread(id, role);
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
    }
  },

  markAllAsRead: async (role) => {
    const prev = get().notifications;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
    try {
      await notificationService.markAllAsRead(role);
    } catch {
      set({ notifications: prev });
    }
  },

  deleteNotification: async (id, role) => {
    const prev = get().notifications;
    // Close detail panel if deleted notification was selected
    if (get().selectedNotification?.id === id) {
      set({ selectedNotification: null });
    }
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    try {
      await notificationService.deleteNotification(id, role);
    } catch {
      set({ notifications: prev });
    }
  },

  archiveNotification: async (id, role) => {
    if (get().selectedNotification?.id === id) {
      set({ selectedNotification: null });
    }
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isArchived: true } : n
      ),
    }));
    try {
      await notificationService.archiveNotification(id, role);
    } catch {
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isArchived: false } : n
        ),
      }));
    }
  },

  updatePreferences: async (prefs) => {
    const prev = get().preferences;
    set((state) => ({ preferences: { ...state.preferences, ...prefs } }));
    try {
      await notificationService.updatePreferences(prefs);
    } catch {
      set({ preferences: prev });
    }
  },

  // ── UI Actions ─────────────────────────────────────────────────────────────

  setDrawerOpen: (open) => set({ drawerOpen: open }),
  toggleDrawer: () => set((state) => ({ drawerOpen: !state.drawerOpen })),

  setSelectedNotification: (notification) => {
    // Auto-mark as read when selected
    if (notification && !notification.isRead) {
      get().markAsRead(notification.id);
    }
    set({ selectedNotification: notification });
  },

  clearSelectedNotification: () => set({ selectedNotification: null }),

  setPreferencesOpen: (open) => set({ preferencesOpen: open }),

  // ── Filtering & Search ─────────────────────────────────────────────────────

  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '' }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () =>
    set({
      filters: { category: 'all', status: 'all', dateRange: null },
      searchQuery: '',
    }),

  // ── Simulated Real-Time ────────────────────────────────────────────────────

  startSimulatedUpdates: () => {
    const cleanup = notificationService.simulateNewNotification(
      (newNotification) => {
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      15000
    );
    set({ _simulationCleanup: cleanup });
  },

  stopSimulatedUpdates: () => {
    const cleanup = get()._simulationCleanup;
    if (typeof cleanup === 'function') cleanup();
    set({ _simulationCleanup: null });
  },

  // ── Computed Selectors ─────────────────────────────────────────────────────

  /**
   * Returns visible (non-archived) notifications.
   */
  getActiveNotifications: () =>
    get().notifications.filter((n) => !n.isArchived),

  /**
   * Unread count for the badge.
   */
  getUnreadCount: () =>
    get().notifications.filter((n) => !n.isRead && !n.isArchived).length,

  /**
   * Apply filters + search to the active notification list.
   */
  getFilteredNotifications: () => {
    const { notifications, filters, searchQuery } = get();
    let list = notifications.filter((n) => !n.isArchived);

    // Status filter
    if (filters.status === 'unread') list = list.filter((n) => !n.isRead);
    if (filters.status === 'read') list = list.filter((n) => n.isRead);

    // Category filter
    if (filters.category !== 'all') {
      list = list.filter((n) => n.category === filters.category);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.shortDescription.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Group filtered notifications into temporal buckets.
   * Returns { today: [], yesterday: [], thisWeek: [], older: [] }
   */
  getGroupedNotifications: () => {
    const list = get().getFilteredNotifications();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = { today: [], yesterday: [], thisWeek: [], older: [] };

    list.forEach((n) => {
      const d = new Date(n.date);
      if (d >= todayStart) groups.today.push(n);
      else if (d >= yesterdayStart) groups.yesterday.push(n);
      else if (d >= weekStart) groups.thisWeek.push(n);
      else groups.older.push(n);
    });

    return groups;
  },
}));

// ── Convenience hooks ──────────────────────────────────────────────────────────
export const useNotifications = () => useNotificationStore((s) => s.notifications);
export const useUnreadCount = () => useNotificationStore((s) => s.getUnreadCount());
export const useDrawerOpen = () => useNotificationStore((s) => s.drawerOpen);
export const useNotificationFilters = () => useNotificationStore((s) => s.filters);
export const useSelectedNotification = () =>
  useNotificationStore((s) => s.selectedNotification);
