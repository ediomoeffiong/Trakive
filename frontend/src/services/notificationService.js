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

export const notificationService = {
  /**
   * Fetch all notifications for a given role (or active user role).
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getNotifications: async (role) => {
    await delay(500);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return [..._supervisorNotifications];
    }
    return [..._internNotifications];
  },

  /**
   * Fetch all announcements.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getAnnouncements: async (role) => {
    await delay(400);
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
    await delay(350);
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
    await delay(300);
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
    await delay(200);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorNotifications = _supervisorNotifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return _supervisorNotifications.find((n) => n.id === id);
    }
    _internNotifications = _internNotifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return _internNotifications.find((n) => n.id === id);
  },

  /**
   * Mark a single notification as unread.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<object>} Updated notification
   */
  markAsUnread: async (id, role) => {
    await delay(200);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorNotifications = _supervisorNotifications.map((n) =>
        n.id === id ? { ...n, isRead: false } : n
      );
      return _supervisorNotifications.find((n) => n.id === id);
    }
    _internNotifications = _internNotifications.map((n) =>
      n.id === id ? { ...n, isRead: false } : n
    );
    return _internNotifications.find((n) => n.id === id);
  },

  /**
   * Mark all notifications as read.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  markAllAsRead: async (role) => {
    await delay(300);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorNotifications = _supervisorNotifications.map((n) => ({ ...n, isRead: true }));
      return [..._supervisorNotifications];
    }
    _internNotifications = _internNotifications.map((n) => ({ ...n, isRead: true }));
    return [..._internNotifications];
  },

  /**
   * Soft-delete a notification.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<{ success: boolean }>}
   */
  deleteNotification: async (id, role) => {
    await delay(250);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorNotifications = _supervisorNotifications.filter((n) => n.id !== id);
    } else {
      _internNotifications = _internNotifications.filter((n) => n.id !== id);
    }
    return { success: true };
  },

  /**
   * Archive a notification.
   * @param {string} id
   * @param {string} [role]
   * @returns {Promise<object>} Updated notification
   */
  archiveNotification: async (id, role) => {
    await delay(250);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorNotifications = _supervisorNotifications.map((n) =>
        n.id === id ? { ...n, isArchived: true } : n
      );
      return _supervisorNotifications.find((n) => n.id === id);
    }
    _internNotifications = _internNotifications.map((n) =>
      n.id === id ? { ...n, isArchived: true } : n
    );
    return _internNotifications.find((n) => n.id === id);
  },

  /**
   * Update notification preferences.
   * @param {object} prefs
   * @param {string} [role]
   * @returns {Promise<object>} Updated preferences
   */
  updatePreferences: async (prefs, role) => {
    await delay(350);
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
