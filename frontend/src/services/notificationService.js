/**
 * @file notificationService.js
 * @description Role-aware mock service layer for Trakive's Notifications & Communication Center.
 *
 * Supports both Intern and Supervisor portals seamlessly.
 * All methods return Promises with artificial delays to simulate backend responses.
 */

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

/** Artificial network delay */
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state
let _internNotifications = [...mockNotifications];
let _supervisorNotifications = [...mockSupervisorNotifications];
let _preferences = { ...defaultNotificationPreferences };
let _supervisorPreferences = { ...defaultSupervisorPreferences };

const getEffectiveRole = (explicitRole) => {
  if (explicitRole) return explicitRole;
  try {
    const currentUser = useAppStore.getState()?.user;
    return currentUser?.role || 'Intern';
  } catch {
    return 'Intern';
  }
};

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@trakive.com', 'supervisor@trakive.com', 'hr@trakive.com', 'head@trakive.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
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
    await delay(250);
    const activeRole = getEffectiveRole(role);
    const key = getUserNotifKey(activeRole);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize with default dataset for role
    const initial = activeRole === 'Supervisor' ? [...mockSupervisorNotifications] : [...mockNotifications];
    saveUserNotifications(initial, activeRole);
    return initial;
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

    const existing = await notificationService.getNotifications(activeRole);
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
    await delay(200);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorPreferences = { ..._supervisorPreferences, ...prefs };
      return { ..._supervisorPreferences };
    }
    _preferences = { ..._preferences, ...prefs };
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
