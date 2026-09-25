/**
 * @file notificationService.js
 * @description Server-backed notification center service.
 */

import api, { getWithDedup } from './api';
import { defaultNotificationPreferences } from '../data/notificationPreferences';
import { useAppStore } from '../store/useAppStore';
import { settingsService } from './settingsService';

const dataOf = (response) => response?.data?.data ?? response?.data;

const listOf = (response) => {
  const payload = dataOf(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getEffectiveRole = (explicitRole) =>
  explicitRole || useAppStore.getState()?.user?.role || 'Intern';

const typeToCategory = (type = '', title = '') => {
  const normalized = String(type).toLowerCase();
  const normalizedTitle = String(title).toLowerCase();
  if (normalizedTitle.includes('announcement')) return 'announcement';
  if (/reminder|deadline|overdue/.test(normalizedTitle)) return 'reminder';
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
    return isSupervisor
      ? linkUrl.replace(/^\/projects/, '/supervisor/projects')
      : linkUrl.replace(/^\/projects/, '/dashboard/projects');
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
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const mapApiNotification = (notification, role) => ({
  id: notification.id,
  category: typeToCategory(notification.type, notification.title),
  title: notification.title || 'Notification',
  shortDescription: notification.message || '',
  message: notification.message || '',
  timestamp: relativeTime(notification.created_at),
  date: notification.created_at || null,
  isRead: Boolean(notification.is_read),
  isArchived: Boolean(notification.archived_at),
  actionLabel: notification.link_url ? 'View Details' : undefined,
  actionRoute: normalizeActionRoute(notification.link_url, role, notification.type),
  linkUrl: notification.link_url,
  priority: 'normal',
  type: notification.type,
});

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Recently'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const daysUntil = (value) => {
  if (!value) return null;
  const due = new Date(String(value).slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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

const getMondayOfWeek = () => {
  const date = new Date();
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().split('T')[0];
};

const mapAnnouncement = (notification) => ({
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

const mapNotificationReminder = (notification, role) => ({
  id: notification.id,
  type: notification.category === 'onboarding' ? 'onboarding' : notification.type === 'weekly' ? 'review' : 'deadline',
  title: notification.title,
  description: notification.message || notification.shortDescription,
  dueDateLabel: /overdue/i.test(notification.title) ? 'Overdue' : notification.timestamp,
  urgency: /overdue/i.test(notification.title) ? 'overdue' : 'warning',
  actionLabel: notification.actionLabel || 'Open',
  actionRoute: notification.actionRoute || (getEffectiveRole(role) === 'Supervisor' ? '/supervisor/dashboard' : '/dashboard'),
  progress: null,
});

const mapTaskReminder = (task, role) => {
  const isSupervisor = getEffectiveRole(role) === 'Supervisor';
  const due = task.due_date || task.dueDate;
  const assignee = task.assignee_name || [task.assignee_first_name, task.assignee_last_name].filter(Boolean).join(' ');
  return {
    id: `task-${task.id}`,
    type: 'deadline',
    title: isSupervisor && assignee ? `${assignee}: ${task.title}` : (task.title || 'Untitled task'),
    description: isSupervisor ? `Task needs attention${assignee ? ` from ${assignee}` : ''}.` : 'This task needs your attention.',
    dueDateLabel: dueDateLabel(due),
    urgency: urgencyForDueDate(due),
    actionLabel: isSupervisor ? 'Review Tasks' : 'View Task',
    actionRoute: isSupervisor ? '/supervisor/tasks' : `/dashboard/tasks/${task.id}`,
    progress: task.progress ?? null,
  };
};

const preferenceKeyForCategory = (category) => ({
  task_assigned: 'taskNotifications',
  task_updated: 'taskNotifications',
  weekly_summary: 'weeklyDigest',
  onboarding: 'onboardingUpdates',
  reminder: 'reminders',
  announcement: 'announcements',
  system_update: 'systemUpdates',
})[category];

const applyPreferences = (notifications, preferences) => {
  if (preferences.inAppNotifications === false) return [];
  return notifications.filter((notification) => {
    const key = preferenceKeyForCategory(notification.category);
    return !key || preferences[key] !== false;
  });
};

const notificationRequests = new Map();

export const notificationService = {
  getNotifications: async (role) => {
    const requestKey = getEffectiveRole(role);
    if (!notificationRequests.has(requestKey)) {
      const request = (async () => {
        const response = await getWithDedup('/notifications');
        const mapped = listOf(response).map((notification) => mapApiNotification(notification, role));
        const settings = await settingsService.fetchSettings();
        return applyPreferences(mapped, settings?.notifications || {});
      })().finally(() => {
        notificationRequests.delete(requestKey);
      });
      notificationRequests.set(requestKey, request);
    }
    return notificationRequests.get(requestKey);
  },

  // Notifications are created by backend domain actions. Creating a local-only
  // notification would misrepresent unsaved data, so callers intentionally get null.
  createNotification: async () => null,

  getAnnouncements: async (role, sourceNotifications) => {
    const notifications = Array.isArray(sourceNotifications)
      ? sourceNotifications
      : await notificationService.getNotifications(role);
    return notifications
      .filter((notification) =>
        ['announcement', 'dept_announcement', 'company_announcement'].includes(notification.category) ||
        String(notification.type || '').toLowerCase() === 'message')
      .map(mapAnnouncement);
  },

  getReminders: async (role, sourceNotifications) => {
    const activeRole = getEffectiveRole(role);
    const isSupervisor = activeRole === 'Supervisor';
    const notificationsPromise = Array.isArray(sourceNotifications)
      ? Promise.resolve(sourceNotifications)
      : notificationService.getNotifications(activeRole);
    const tasksPromise = getWithDedup(
      '/tasks',
      { params: { page: 1, limit: 100, sort: 'due_date:asc' } },
    )
      .then(listOf);
    const weeklyPromise = isSupervisor
      ? api.get('/weekly-plans', { params: { week_start: getMondayOfWeek(), limit: 100 } }).then(listOf)
      : Promise.resolve([]);

    const [notifications, tasks, weeklyPlans] = await Promise.all([
      notificationsPromise,
      tasksPromise,
      weeklyPromise,
    ]);
    const notificationReminders = notifications
      .filter((notification) =>
        ['reminder', 'reminder_due_today', 'weekly_summary', 'onboarding'].includes(notification.category) ||
        /deadline|overdue|reminder|due/i.test(`${notification.title} ${notification.message}`))
      .map((notification) => mapNotificationReminder(notification, activeRole));
    const taskReminders = tasks
      .filter((task) => {
        const status = String(task.status || '').toLowerCase().replace(/_/g, '-');
        const days = daysUntil(task.due_date || task.dueDate);
        return !['completed', 'reviewed', 'archived', 'cancelled'].includes(status) && days !== null && days <= 7;
      })
      .map((task) => mapTaskReminder(task, activeRole));
    const weeklyReminders = weeklyPlans
      .filter((plan) => String(plan.status || '').toLowerCase() === 'submitted')
      .map((plan, index) => ({
        id: `weekly-${plan.id || index}`,
        type: 'review',
        title: `Review weekly report${plan.intern_name || plan.internName ? `: ${plan.intern_name || plan.internName}` : ''}`,
        description: plan.title || 'A submitted weekly plan is waiting for supervisor review.',
        dueDateLabel: plan.created_at ? `Submitted ${relativeTime(plan.created_at)}` : 'Pending review',
        urgency: 'warning',
        actionLabel: 'Review',
        actionRoute: '/supervisor/tasks',
        progress: null,
      }));
    return Array.from(new Map(
      [...notificationReminders, ...taskReminders, ...weeklyReminders].map((item) => [item.id, item])
    ).values());
  },

  getPreferences: async () => {
    const settings = await settingsService.fetchSettings();
    return { ...defaultNotificationPreferences, ...(settings?.notifications || {}) };
  },

  markAsRead: async (id, role) =>
    mapApiNotification(dataOf(await api.patch(`/notifications/${id}/read`)), role),
  markAsUnread: async (id, role) =>
    mapApiNotification(dataOf(await api.patch(`/notifications/${id}/unread`)), role),
  markAllAsRead: async (role) => {
    const updated = dataOf(await api.patch('/notifications/read-all'));
    return Array.isArray(updated) ? updated.map((notification) => mapApiNotification(notification, role)) : [];
  },
  deleteNotification: async (id) => {
    await api.delete(`/notifications/${id}`);
    return { success: true };
  },
  archiveNotification: async (id, role) =>
    mapApiNotification(dataOf(await api.patch(`/notifications/${id}/archive`)), role),
  updatePreferences: async (preferences) => settingsService.updateSettingsCategory('notifications', {
    ...(preferences || {}),
    emailNotifications: false,
    pushNotifications: false,
  }),

  // Kept for API compatibility; real-time updates must come from the backend.
  simulateNewNotification: () => () => {},
};
