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

let _preferences = { ...defaultNotificationPreferences };
let _supervisorPreferences = { ...defaultSupervisorPreferences };

const MOCK_DATA_ENABLED = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

const hasRealBackendToken = () => {
  const token = getAccessToken();
  return Boolean(token && !String(token).startsWith('mock-') && !String(token).startsWith('mock-jwt-token'));
};

const dataOf = (response) => response?.data?.data ?? response?.data;

const listOf = (response) => {
  const payload = dataOf(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const typeToCategory = (type = '', title = '') => {
  const normalized = String(type || '').toLowerCase();
  const normalizedTitle = String(title || '').toLowerCase();
  if (normalizedTitle.includes('announcement')) return 'announcement';
  if (normalizedTitle.includes('reminder') || normalizedTitle.includes('deadline') || normalizedTitle.includes('overdue')) return 'reminder';
  if (normalized === 'task') return 'task_assigned';
  if (normalized === 'weekly') return 'weekly_summary';
  if (normalized.startsWith('onboarding')) return 'onboarding';
  if (normalized === 'project') return 'task_updated';
  if (normalized === 'attendance' || normalized === 'leave') return 'reminder';
  if (normalized === 'message' || normalized === 'announcement') return 'announcement';
  return 'system_update';
};

const normalizeActionRoute = (linkUrl, role, type) => {
  const isSupervisor = getEffectiveRole(role) === 'Supervisor';
  if (!linkUrl) return isSupervisor ? '/supervisor/dashboard' : '/dashboard';
  if (/^https?:\/\//i.test(linkUrl)) return linkUrl;
  if (linkUrl.startsWith('/dashboard') || linkUrl.startsWith('/supervisor')) return linkUrl;

  if (linkUrl.startsWith('/tasks')) {
    return isSupervisor ? '/supervisor/tasks' : linkUrl.replace(/^\/tasks/, '/dashboard/tasks');
  }
  if (linkUrl.startsWith('/projects')) {
    return isSupervisor ? linkUrl.replace(/^\/projects/, '/supervisor/projects') : linkUrl.replace(/^\/projects/, '/dashboard/projects');
  }
  if (linkUrl.startsWith('/weekly')) {
    return isSupervisor ? '/supervisor/tasks' : '/dashboard/tasks';
  }
  if (linkUrl.startsWith('/onboarding')) {
    return isSupervisor ? '/supervisor/onboarding' : '/dashboard/onboarding';
  }
  if (type === 'task') return isSupervisor ? '/supervisor/tasks' : '/dashboard/tasks';
  return isSupervisor ? '/supervisor/dashboard' : '/dashboard';
};

const relativeTime = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const mapApiNotification = (n, role) => ({
  id: n.id,
  category: typeToCategory(n.type, n.title),
  title: n.title || 'Notification',
  shortDescription: n.message || '',
  message: n.message || '',
  timestamp: relativeTime(n.created_at),
  date: n.created_at || new Date().toISOString(),
  isRead: Boolean(n.is_read),
  isArchived: Boolean(n.archived_at),
  actionLabel: n.link_url ? 'View Details' : undefined,
  actionRoute: normalizeActionRoute(n.link_url, role, n.type),
  linkUrl: n.link_url,
  priority: 'normal',
  type: n.type,
});

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const toDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const daysUntil = (value) => {
  const key = toDateKey(value);
  if (!key) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${key}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
};

const dueDateLabel = (value) => {
  const days = daysUntil(value);
  if (days === null) return '';
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

const urgencyForDueDate = (value) => {
  const days = daysUntil(value);
  if (days === null) return 'normal';
  if (days < 0) return 'overdue';
  if (days <= 1) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
};

const mapAnnouncementFromNotification = (notification) => ({
  id: notification.id,
  title: notification.title,
  author: { name: 'Trakive', role: 'System Announcement' },
  displayDate: formatDate(notification.date),
  priority: notification.priority === 'high' ? 'important' : 'general',
  type: 'general',
  preview: notification.shortDescription || notification.message,
  body: notification.message,
  tags: [notification.type || notification.category].filter(Boolean),
});

const mapReminderFromNotification = (notification, role) => ({
  id: notification.id,
  type: notification.category === 'onboarding' ? 'onboarding' : notification.type === 'weekly' ? 'review' : 'deadline',
  title: notification.title,
  description: notification.message || notification.shortDescription,
  dueDateLabel: notification.title?.toLowerCase().includes('overdue') ? 'Overdue' : notification.timestamp,
  urgency: notification.title?.toLowerCase().includes('overdue') ? 'overdue' : 'warning',
  actionLabel: notification.actionLabel || 'Open',
  actionRoute: notification.actionRoute || (getEffectiveRole(role) === 'Supervisor' ? '/supervisor/dashboard' : '/dashboard'),
  progress: null,
});

const mapTaskReminder = (task, role) => {
  const isSupervisor = getEffectiveRole(role) === 'Supervisor';
  const due = task.due_date || task.dueDate;
  const title = task.title || 'Untitled task';
  const assignee = task.assignee_name || [task.assignee_first_name, task.assignee_last_name].filter(Boolean).join(' ');
  return {
    id: `task-${task.id}`,
    type: 'deadline',
    title: isSupervisor && assignee ? `${assignee}: ${title}` : title,
    description: isSupervisor
      ? `Task needs attention${assignee ? ` from ${assignee}` : ''}.`
      : 'This task needs your attention.',
    dueDateLabel: dueDateLabel(due),
    urgency: urgencyForDueDate(due),
    actionLabel: isSupervisor ? 'Review Tasks' : 'View Task',
    actionRoute: isSupervisor ? '/supervisor/tasks' : `/dashboard/tasks/${task.id}`,
    progress: task.progress ?? null,
  };
};

const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
};

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
        const list = listOf(await api.get('/notifications'));
        if (Array.isArray(list)) {
          const mapped = list.map((n) => mapApiNotification(n, role));
          const settings = await settingsService.fetchSettings();
          return applyNotificationPreferences(mapped, settings.notifications || {});
        }
      } catch (err) {
        throw new Error(err?.response?.data?.message || err?.message || 'Failed to load notifications');
      }
    }
    if (!MOCK_DATA_ENABLED) return [];
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

    if (!MOCK_DATA_ENABLED) return null;

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
    if (hasRealBackendToken()) {
      const notifications = await notificationService.getNotifications(role);
      return notifications
        .filter((notification) =>
          ['announcement', 'dept_announcement', 'company_announcement'].includes(notification.category) ||
          String(notification.type || '').toLowerCase() === 'message'
        )
        .map(mapAnnouncementFromNotification);
    }
    if (!MOCK_DATA_ENABLED) return [];
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
    if (hasRealBackendToken()) {
      const activeRole = getEffectiveRole(role);
      const isSupervisor = activeRole === 'Supervisor';
      const notificationsPromise = notificationService
        .getNotifications(activeRole)
        .then((notifications) =>
          notifications
            .filter((notification) =>
              ['reminder', 'reminder_due_today', 'weekly_summary', 'onboarding'].includes(notification.category) ||
              /deadline|overdue|reminder|due/i.test(`${notification.title} ${notification.message}`)
            )
            .map((notification) => mapReminderFromNotification(notification, activeRole))
        );

      const tasksPromise = api
        .get('/tasks', { params: { page: 1, limit: 100, sort: 'due_date:asc' } })
        .then((response) => listOf(response))
        .catch(() => []);

      const weeklyPromise = isSupervisor
        ? api.get('/weekly-plans', { params: { week_start: getMondayOfWeek(), limit: 100 } }).then((response) => listOf(response)).catch(() => [])
        : Promise.resolve([]);

      const [notificationReminders, tasks, weeklyPlans] = await Promise.all([notificationsPromise, tasksPromise, weeklyPromise]);
      const taskReminders = tasks
        .filter((task) => {
          const status = String(task.status || '').toLowerCase().replace(/_/g, '-');
          if (['completed', 'reviewed', 'archived', 'cancelled'].includes(status)) return false;
          const days = daysUntil(task.due_date || task.dueDate);
          return days !== null && days <= 7;
        })
        .map((task) => mapTaskReminder(task, activeRole));

      const weeklyReminders = weeklyPlans
        .filter((plan) => String(plan.status || '').toLowerCase() === 'submitted')
        .map((plan, idx) => ({
          id: `weekly-${plan.id || idx}`,
          type: 'review',
          title: `Review weekly report${plan.intern_name || plan.internName ? `: ${plan.intern_name || plan.internName}` : ''}`,
          description: plan.title || 'A submitted weekly plan is waiting for supervisor review.',
          dueDateLabel: plan.created_at ? `Submitted ${relativeTime(plan.created_at)}` : 'Pending review',
          urgency: 'warning',
          actionLabel: 'Review',
          actionRoute: '/supervisor/tasks',
          progress: null,
        }));

      const deduped = new Map();
      [...notificationReminders, ...taskReminders, ...weeklyReminders].forEach((reminder) => {
        if (!deduped.has(reminder.id)) deduped.set(reminder.id, reminder);
      });
      return Array.from(deduped.values());
    }
    if (!MOCK_DATA_ENABLED) return [];
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
        callback(newNotif);
        idx++;
      } else {
        clearInterval(timerId);
      }
    }, intervalMs);

    return () => clearInterval(timerId);
  },
};
