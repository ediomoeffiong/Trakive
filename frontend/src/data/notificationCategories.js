/**
 * @file notificationCategories.js
 * @description Category metadata for all notification types in Trakive.
 * Includes all 10 core categories:
 * 1. Task & Assignment
 * 2. Internship / Employee
 * 3. Leave & Attendance
 * 4. Performance & Reviews
 * 5. Communication
 * 6. Department / Supervisor
 * 7. Account & Security
 * 8. System Notifications
 * 9. Reminders
 * 10. Admin Notifications
 */

export const notificationCategories = [
  // ── 1. Task & Assignment ───────────────────────────────────────────────────
  { key: 'task_assigned', label: 'Task Assigned', icon: 'RiTaskLine', color: '#6366f1', bgColor: '#eef2ff' },
  { key: 'task_updated', label: 'Task Updated', icon: 'RiEdit2Line', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { key: 'task_deadline', label: 'Task Deadline', icon: 'RiTimeLine', color: '#f59e0b', bgColor: '#fffbeb' },
  { key: 'task_overdue', label: 'Task Overdue', icon: 'RiAlarmWarningLine', color: '#ef4444', bgColor: '#fef2f2' },
  { key: 'task_completed', label: 'Task Completed', icon: 'RiCheckboxCircleLine', color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'task_rejected', label: 'Task Rejected', icon: 'RiCloseCircleLine', color: '#dc2626', bgColor: '#fef2f2' },
  { key: 'task_reassigned', label: 'Task Reassigned', icon: 'RiExchangeLine', color: '#0284c7', bgColor: '#f0f9ff' },
  { key: 'task_priority_changed', label: 'Priority Changed', icon: 'RiFlagLine', color: '#d97706', bgColor: '#fffbeb' },
  { key: 'task_comment', label: 'Task Comment', icon: 'RiChat3Line', color: '#4f46e5', bgColor: '#eef2ff' },
  { key: 'submission_reviewed', label: 'Submission Reviewed', icon: 'RiCheckboxCircleLine', color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'task_submitted', label: 'Task Submitted', icon: 'RiSendPlaneLine', color: '#6366f1', bgColor: '#eef2ff' },

  // ── 2. Internship / Employee ──────────────────────────────────────────────
  { key: 'new_intern', label: 'New Employee/Intern', icon: 'RiUserAddLine', color: '#2563eb', bgColor: '#eff6ff' },
  { key: 'onboarding', label: 'Onboarding', icon: 'RiMapLine', color: '#0ea5e9', bgColor: '#f0f9ff' },
  { key: 'onboarding_completed', label: 'Onboarding Done', icon: 'RiCheckboxCircleLine', color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'onboarding_incomplete', label: 'Onboarding Incomplete', icon: 'RiErrorWarningLine', color: '#f59e0b', bgColor: '#fffbeb' },
  { key: 'onboarding_deadline', label: 'Onboarding Deadline', icon: 'RiTimerLine', color: '#ea580c', bgColor: '#fff7ed' },
  { key: 'internship_milestone', label: 'Internship Milestone', icon: 'RiMedalLine', color: '#9333ea', bgColor: '#faf5ff' },
  { key: 'internship_ended', label: 'Contract Ended', icon: 'RiCalendarEventLine', color: '#64748b', bgColor: '#f8fafc' },
  { key: 'profile_update', label: 'Profile Update', icon: 'RiUser3Line', color: '#3b82f6', bgColor: '#eff6ff' },

  // ── 3. Leave & Attendance ──────────────────────────────────────────────────
  { key: 'leave_submitted', label: 'Leave Requested', icon: 'RiCalendarCheckLine', color: '#0284c7', bgColor: '#f0f9ff' },
  { key: 'leave_approved', label: 'Leave Approved', icon: 'RiCheckboxCircleLine', color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'leave_rejected', label: 'Leave Rejected', icon: 'RiCloseCircleLine', color: '#ef4444', bgColor: '#fef2f2' },
  { key: 'leave_cancelled', label: 'Leave Cancelled', icon: 'RiCalendar2Line', color: '#6b7280', bgColor: '#f9fafb' },
  { key: 'attendance_missing', label: 'Missing Attendance', icon: 'RiTimeOffLine', color: '#f59e0b', bgColor: '#fffbeb' },
  { key: 'attendance_late', label: 'Late Arrival', icon: 'RiHistoryLine', color: '#d97706', bgColor: '#fffbeb' },

  // ── 4. Performance & Reviews ───────────────────────────────────────────────
  { key: 'performance_review', label: 'Performance Review', icon: 'RiStarLine', color: '#f97316', bgColor: '#fff7ed' },
  { key: 'performance_review_due', label: 'Review Due', icon: 'RiStarLine', color: '#f97316', bgColor: '#fff7ed' },
  { key: 'review_completed', label: 'Review Completed', icon: 'RiAwardLine', color: '#10b981', bgColor: '#ecfdf5' },
  { key: 'feedback_received', label: 'Feedback Received', icon: 'RiMessage3Line', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { key: 'target_assigned', label: 'Performance Target', icon: 'RiAimLine', color: '#4f46e5', bgColor: '#eef2ff' },
  { key: 'performance_improvement', label: 'Improvement Action', icon: 'RiThunderstormsLine', color: '#dc2626', bgColor: '#fef2f2' },

  // ── 5. Communication ───────────────────────────────────────────────────────
  { key: 'user_mentioned', label: 'Mentioned You', icon: 'RiAtLine', color: '#ec4899', bgColor: '#fdf2f8' },
  { key: 'comment_reply', label: 'Comment Reply', icon: 'RiReplyLine', color: '#6366f1', bgColor: '#eef2ff' },
  { key: 'direct_message', label: 'Direct Message', icon: 'RiMailSendLine', color: '#3b82f6', bgColor: '#eff6ff' },
  { key: 'announcement', label: 'Announcement', icon: 'RiMegaphoneLine', color: '#ec4899', bgColor: '#fdf2f8' },
  { key: 'dept_announcement', label: 'Dept Announcement', icon: 'RiBroadcastLine', color: '#a855f7', bgColor: '#faf5ff' },

  // ── 6. Department / Supervisor ──────────────────────────────────────────────
  { key: 'dept_member_joined', label: 'New Team Member', icon: 'RiUserFollowLine', color: '#2563eb', bgColor: '#eff6ff' },
  { key: 'intern_action_needed', label: 'Supervisor Action', icon: 'RiErrorWarningLine', color: '#eab308', bgColor: '#fefce8' },
  { key: 'supervisor_changed', label: 'Supervisor Changed', icon: 'RiUserSharedLine', color: '#0ea5e9', bgColor: '#f0f9ff' },
  { key: 'intern_assigned', label: 'Intern Assigned', icon: 'RiUser3Line', color: '#3b82f6', bgColor: '#eff6ff' },

  // ── 7. Account & Security ──────────────────────────────────────────────────
  { key: 'new_login_detected', label: 'New Login', icon: 'RiShieldUserLine', color: '#059669', bgColor: '#ecfdf5' },
  { key: 'password_changed', label: 'Password Changed', icon: 'RiLockPasswordLine', color: '#2563eb', bgColor: '#eff6ff' },
  { key: 'security_alert', label: 'Security Alert', icon: 'RiShieldCrossLine', color: '#dc2626', bgColor: '#fef2f2' },

  // ── 8. System Notifications ────────────────────────────────────────────────
  { key: 'system_update', label: 'System Update', icon: 'RiSettings3Line', color: '#6b7280', bgColor: '#f9fafb' },
  { key: 'system_maintenance', label: 'System Maintenance', icon: 'RiToolsLine', color: '#d97706', bgColor: '#fffbeb' },

  // ── 9. Reminders ───────────────────────────────────────────────────────────
  { key: 'reminder', label: 'Reminder', icon: 'RiAlarmLine', color: '#14b8a6', bgColor: '#f0fdfa' },
  { key: 'reminder_due_today', label: 'Due Today', icon: 'RiAlarmWarningLine', color: '#ef4444', bgColor: '#fef2f2' },
  { key: 'upcoming_meeting', label: 'Upcoming Meeting', icon: 'RiVideoChatLine', color: '#6366f1', bgColor: '#eef2ff' },

  // ── 10. Admin Notifications ────────────────────────────────────────────────
  { key: 'admin_notification', label: 'Admin Alert', icon: 'RiAdminLine', color: '#7c3aed', bgColor: '#f5f3ff' },
  { key: 'account_awaiting_approval', label: 'Approval Awaiting', icon: 'RiUserClockLine', color: '#d97706', bgColor: '#fffbeb' },
  { key: 'system_error', label: 'System Error', icon: 'RiBugLine', color: '#dc2626', bgColor: '#fef2f2' },
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
