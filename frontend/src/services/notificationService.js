/**
 * @file notificationService.js
 * @description Role-aware service layer for Trakive's Notifications & Communication Center.
 *
 * Supports both Intern and Supervisor portals seamlessly.
 */

import api from './api';
import {
  mockNotifications,
  mockAnnouncements,
  mockReminders,
  defaultNotificationPreferences,
  mockSupervisorNotifications,
  mockSupervisorAnnouncements,
  mockSupervisorReminders,
  defaultSupervisorPreferences,
} from '../data';
import { useAppStore } from '../store/useAppStore';
import { getAccessToken } from '../utils/authSession';
import { settingsService } from './settingsService';

/** Artificial network delay */
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state
let _internNotifications = [];
let _supervisorNotifications = [];
let _preferences = { ...defaultNotificationPreferences };
let _supervisorPreferences = { ...defaultSupervisorPreferences };

const hasRealBackendToken = () => {
  const token = getAccessToken();
  return Boolean(token && !String(token).startsWith('mock-') && !String(token).startsWith('mock-jwt-token'));
};

const dataOf = (response) => response?.data?.data ?? response?.data;

const typeToCategory = (type = '') => {
  const normalized = String(type || '').toLowerCase();
  if (normalized === 'task') return 'task_assigned';
  if (normalized === 'weekly') return 'weekly_summary';
  if (normalized.startsWith('onboarding')) return 'onboarding';
  if (normalized === 'project') return 'task_updated';
  if (normalized === 'attendance' || normalized === 'leave') return 'reminder';
  if (normalized === 'message') return 'announcement';
  return 'system_update';
};

const mapApiNotification = (n, role) => ({
  id: n.id,
  category: typeToCategory(n.type),
  title: n.title,
  shortDescription: n.message,
  message: n.message,
  timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
  date: n.created_at || new Date().toISOString(),
  isRead: Boolean(n.is_read),
  isArchived: Boolean(n.archived_at),
  actionLabel: n.link_url ? 'View Details' : undefined,
  actionRoute: n.link_url || (role === 'Supervisor' ? '/supervisor/dashboard' : '/dashboard'),
  linkUrl: n.link_url,
  priority: 'normal',
  type: n.type,
});

const preferenceKeyForCategory = (category) => {
  if (category === 'task_assigned' || category === 'task_updated') return 'taskNotifications';
  if (category === 'weekly_summary') return 'weeklyDigest';
  if (category === 'onboarding') return 'onboardingUpdates';
  if (category === 'reminder') return 'reminders';
  if (category === 'announcement') return 'announcements';
  if (category === 'system_update') return 'systemUpdates';
  return null;
};

const applyNotificationPreferences = (notifications = [], preferences = {}) => {
  if (preferences.inAppNotifications === false) return [];
  return notifications.filter((notification) => {
    const preferenceKey = preferenceKeyForCategory(notification.category);
    return !preferenceKey || preferences[preferenceKey] !== false;
  });
};

const getEffectiveRole = (explicitRole) => {
  if (explicitRole) return explicitRole;
  try {
    const currentUser = useAppStore.getState()?.user;
    return currentUser?.role || 'Intern';
  } catch {
    return 'Intern';
  }
};

// Helper to get/set localStorage key for user notifications
const getUserNotifKey = (role) => {
  try {
    const user = useAppStore.getState()?.user;
    const userId = user?.id || 'guest';
    const activeRole = getEffectiveRole(role);
    return `trakive_notifs_${userId}_${activeRole.toLowerCase().replace(/\s+/g, '_')}`;
  } catch {
    return 'trakive_notifs_guest';
  }
};

const saveUserNotifications = (notifs, role) => {
  try {
    const key = getUserNotifKey(role);
    localStorage.setItem(key, JSON.stringify(notifs));
  } catch {
    // ignore storage errors
  }
};

export const notificationService = {
  /**
   * Fetch all notifications for a given role (or active user role).
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getNotifications: async (role) => {
    if (hasRealBackendToken()) {
      try {
        const list = dataOf(await api.get('/notifications'));
        if (Array.isArray(list)) {
          const mapped = list.map((n) => mapApiNotification(n, role));
          const settings = await settingsService.fetchSettings();
          return applyNotificationPreferences(mapped, settings.notifications || {});
        }
      } catch {
        // Fall back to durable local notifications when the API is unavailable.
      }
    }
    const activeRole = getEffectiveRole(role);
    const key = getUserNotifKey(activeRole);
    const saved = localStorage.getItem(key);
    if (saved) {
      const settings = await settingsService.fetchSettings();
      return applyNotificationPreferences(JSON.parse(saved), settings.notifications || {});
    }
    return [];
  },

  /**
   * Create & dispatch a real notification.
   * @param {object} data
   * @param {string} [role]
   * @returns {Promise<object>} Created notification
   */
  createNotification: async (data, role) => {
    const activeRole = getEffectiveRole(role);
    const newNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: data.category || 'system_update',
      title: data.title || 'Notification',
      shortDescription: data.shortDescription || data.message || '',
      message: data.message || data.shortDescription || '',
      timestamp: 'Just now',
      date: new Date().toISOString(),
      isRead: false,
      isArchived: false,
      sender: data.sender || { name: 'System', role: 'Automated', avatar: null },
      relatedModule: data.relatedModule || 'dashboard',
      relatedId: data.relatedId || null,
      actionLabel: data.actionLabel || 'View Details',
      actionRoute: data.actionRoute || (activeRole === 'Supervisor' ? '/supervisor/dashboard' : '/dashboard'),
      priority: data.priority || 'normal',
    };

    // Synchronously read current storage to prevent async race condition during login
    const key = getUserNotifKey(activeRole);
    const saved = localStorage.getItem(key);
    let existing = [];
    if (saved) {
      try {
        existing = JSON.parse(saved);
      } catch {
        existing = [];
      }
    } else {
      existing = activeRole === 'Supervisor' ? [...mockSupervisorNotifications] : [...mockNotifications];
    }

    const updated = [newNotif, ...existing];
    saveUserNotifications(updated, activeRole);
    return newNotif;
  },

  /**
   * Fetch all announcements.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getAnnouncements: async (role) => {
    await delay(250);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return [...mockSupervisorAnnouncements];
    }
    return [...mockAnnouncements];
  },

  /**
   * Fetch all reminders.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getReminders: async (role) => {
    await delay(250);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return [...mockSupervisorReminders];
    }
    return [...mockReminders];
  },

  /**
   * Fetch notification preferences for the current user.
   * @param {string} [role]
   * @returns {Promise<object>}
   */
  getPreferences: async (role) => {
    if (hasRealBackendToken()) {
      const settings = await settingsService.fetchSettings();
      return { ...defaultNotificationPreferences, ...(settings.notifications || {}) };
    }
    await delay(200);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return { ..._supervisorPreferences };
    }
    return { ..._preferences };
  },

  /**
   * Mark a single notification as read.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<object>} Updated notification
   */
  markAsRead: async (id, role) => {
    if (hasRealBackendToken()) {
      const updated = dataOf(await api.patch(`/notifications/${id}/read`));
      return mapApiNotification(updated, role);
    }
    await delay(150);
    const activeRole = getEffectiveRole(role);
    const list = await notificationService.getNotifications(activeRole);
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveUserNotifications(updated, activeRole);
    return updated.find((n) => n.id === id);
  },

  /**
   * Mark a single notification as unread.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<object>} Updated notification
   */
  markAsUnread: async (id, role) => {
    if (hasRealBackendToken()) {
      const updated = dataOf(await api.patch(`/notifications/${id}/unread`));
      return mapApiNotification(updated, role);
    }
    await delay(150);
    const activeRole = getEffectiveRole(role);
    const list = await notificationService.getNotifications(activeRole);
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: false } : n));
    saveUserNotifications(updated, activeRole);
    return updated.find((n) => n.id === id);
  },

  /**
   * Mark all notifications as read.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  markAllAsRead: async (role) => {
    if (hasRealBackendToken()) {
      const updated = dataOf(await api.patch('/notifications/read-all'));
      return Array.isArray(updated) ? updated.map((n) => mapApiNotification(n, role)) : [];
    }
    await delay(200);
    const activeRole = getEffectiveRole(role);
    const list = await notificationService.getNotifications(activeRole);
    const updated = list.map((n) => ({ ...n, isRead: true }));
    saveUserNotifications(updated, activeRole);
    return updated;
  },

  /**
   * Soft-delete a notification.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<{ success: boolean }>}
   */
  deleteNotification: async (id, role) => {
    if (hasRealBackendToken()) {
      await api.delete(`/notifications/${id}`);
      return { success: true };
    }
    await delay(150);
    const activeRole = getEffectiveRole(role);
    const list = await notificationService.getNotifications(activeRole);
    const updated = list.filter((n) => n.id !== id);
    saveUserNotifications(updated, activeRole);
    return { success: true };
  },

  /**
   * Archive a notification.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<object>} Updated notification
   */
  archiveNotification: async (id, role) => {
    if (hasRealBackendToken()) {
      const updated = dataOf(await api.patch(`/notifications/${id}/archive`));
      return mapApiNotification(updated, role);
    }
    await delay(150);
    const activeRole = getEffectiveRole(role);
    const list = await notificationService.getNotifications(activeRole);
    const updated = list.map((n) => (n.id === id ? { ...n, isArchived: true } : n));
    saveUserNotifications(updated, activeRole);
    return updated.find((n) => n.id === id);
  },

  /**
   * Update notification preferences.
   * @param {object} prefs
   * @param {string} [role]
   * @returns {Promise<object>} Updated preferences
   */
  updatePreferences: async (prefs, role) => {
    const normalizedPrefs = {
      ...(prefs || {}),
      emailNotifications: false,
      pushNotifications: false,
    };
    if (hasRealBackendToken()) {
      return settingsService.updateSettingsCategory('notifications', normalizedPrefs);
    }
    await delay(200);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorPreferences = { ..._supervisorPreferences, ...normalizedPrefs };
      return { ..._supervisorPreferences };
    }
    _preferences = { ..._preferences, ...normalizedPrefs };
    return { ..._preferences };
  },

  /**
   * Simulate a real-time notification arriving.
   * @param {function} callback - Called with the new notification object
   * @param {number} [intervalMs=15000]
   * @param {string} [role]
   * @returns {function} Cleanup function
   */
  simulateNewNotification: (callback, intervalMs = 15000, role) => {
    const activeRole = getEffectiveRole(role);

    const simulatedSupervisorNotifs = [
      {
        id: `sup-notif-sim-${Date.now()}`,
        category: 'task_submitted',
        title: 'New Task Submitted for Review',
        shortDescription: "Sarah Lee submitted 'Mobile Responsive Layouts'.",
        message:
          "Sarah Lee has completed and submitted 'Mobile Responsive Layouts'. Deliverables include wireframes and component test suites. Please review and score.",
        timestamp: 'Just now',
        date: new Date().toISOString(),
        isRead: false,
        isArchived: false,
        sender: { name: 'Sarah Lee', role: 'UI/UX Intern', avatar: null },
        relatedModule: 'reviews',
        relatedId: 'rev-sub-sim',
        actionLabel: 'Review Submission',
        actionRoute: '/supervisor/reviews',
        priority: 'high',
      },
    ];

    const simulatedInternNotifs = [
      {
        id: `notif-sim-${Date.now()}`,
        category: 'task_assigned',
        title: 'New Task Just Assigned',
        shortDescription: "Your mentor just assigned you 'Code Review: Authentication Module'.",
        message:
          "A new task has just been assigned: 'Code Review: Authentication Module'. Your mentor would like you to review the PR and leave detailed comments. Due: Tomorrow, 3:00 PM.",
        timestamp: 'Just now',
        date: new Date().toISOString(),
        isRead: false,
        isArchived: false,
        sender: { name: 'Jane Smith', role: 'Mentor', avatar: null },
        relatedModule: 'tasks',
        relatedId: 'task-5',
        actionLabel: 'View Task',
        actionRoute: '/dashboard/tasks/task-5',
        priority: 'normal',
      },
    ];

    const targetList = activeRole === 'Supervisor' ? simulatedSupervisorNotifs : simulatedInternNotifs;
    let idx = 0;

    const timerId = setInterval(() => {
      if (idx < targetList.length) {
        const newNotif = {
          ...targetList[idx],
          id: `notif-sim-${Date.now()}`,
          timestamp: 'Just now',
          date: new Date().toISOString(),
        };
        if (activeRole === 'Supervisor') {
          _supervisorNotifications = [newNotif, ..._supervisorNotifications];
        } else {
          _internNotifications = [newNotif, ..._internNotifications];
        }
        callback(newNotif);
        idx++;
      } else {
        clearInterval(timerId);
      }
    }, intervalMs);

    return () => clearInterval(timerId);
  },
};
