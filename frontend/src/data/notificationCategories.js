/**
 * @file notificationCategories.js
 * @description Category metadata for all notification types in Trakive.
 * Each category has a key, label, icon name (react-icons/ri), and color token.
 */

export const notificationCategories = [
  {
    key: 'task_assigned',
    label: 'Task Assigned',
    icon: 'RiTaskLine',
    color: '#6366f1',        // indigo
    bgColor: '#eef2ff',
  },
  {
    key: 'task_updated',
    label: 'Task Updated',
    icon: 'RiEdit2Line',
    color: '#8b5cf6',        // violet
    bgColor: '#f5f3ff',
  },
  {
    key: 'task_deadline',
    label: 'Task Deadline',
    icon: 'RiTimeLine',
    color: '#f59e0b',        // amber
    bgColor: '#fffbeb',
  },
  {
    key: 'submission_reviewed',
    label: 'Submission Reviewed',
    icon: 'RiCheckboxCircleLine',
    color: '#10b981',        // emerald
    bgColor: '#ecfdf5',
  },
  {
    key: 'performance_review',
    label: 'Performance Review',
    icon: 'RiStarLine',
    color: '#f97316',        // orange
    bgColor: '#fff7ed',
  },
  {
    key: 'onboarding',
    label: 'Onboarding',
    icon: 'RiMapLine',
    color: '#0ea5e9',        // sky
    bgColor: '#f0f9ff',
  },
  {
    key: 'announcement',
    label: 'Announcement',
    icon: 'RiMegaphoneLine',
    color: '#ec4899',        // pink
    bgColor: '#fdf2f8',
  },
  {
    key: 'reminder',
    label: 'Reminder',
    icon: 'RiAlarmLine',
    color: '#14b8a6',        // teal
    bgColor: '#f0fdfa',
  },
  {
    key: 'system_update',
    label: 'System Update',
    icon: 'RiSettings3Line',
    color: '#6b7280',        // gray
    bgColor: '#f9fafb',
  },
  {
    key: 'profile_update',
    label: 'Profile Update',
    icon: 'RiUser3Line',
    color: '#3b82f6',        // blue
    bgColor: '#eff6ff',
  },
  {
    key: 'task_submitted',
    label: 'Task Submitted',
    icon: 'RiTaskLine',
    color: '#6366f1',        // indigo
    bgColor: '#eef2ff',
  },
  {
    key: 'onboarding_completed',
    label: 'Onboarding Done',
    icon: 'RiCheckboxCircleLine',
    color: '#10b981',        // emerald
    bgColor: '#ecfdf5',
  },
  {
    key: 'performance_review_due',
    label: 'Review Due',
    icon: 'RiStarLine',
    color: '#f97316',        // orange
    bgColor: '#fff7ed',
  },
  {
    key: 'task_overdue',
    label: 'Task Overdue',
    icon: 'RiTimeLine',
    color: '#ef4444',        // red
    bgColor: '#fef2f2',
  },
  {
    key: 'review_requested',
    label: 'Review Requested',
    icon: 'RiEdit2Line',
    color: '#8b5cf6',        // violet
    bgColor: '#f5f3ff',
  },
  {
    key: 'document_approval',
    label: 'Document Approval',
    icon: 'RiMapLine',
    color: '#0ea5e9',        // sky
    bgColor: '#f0f9ff',
  },
  {
    key: 'intern_assigned',
    label: 'New Intern',
    icon: 'RiUser3Line',
    color: '#3b82f6',        // blue
    bgColor: '#eff6ff',
  },
];

/**
 * Get category config by key
 * @param {string} key
 * @returns {object}
 */
export const getCategoryConfig = (key) =>
  notificationCategories.find((c) => c.key === key) ?? {
    key: 'system_update',
    label: 'Notification',
    icon: 'RiBellLine',
    color: '#6b7280',
    bgColor: '#f9fafb',
  };
