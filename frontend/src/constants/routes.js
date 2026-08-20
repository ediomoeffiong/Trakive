/**
 * @file routes.js
 * @description Centralised route path constants for Trakive.
 * Import these instead of hard-coding strings in components.
 */

export const ROUTES = {
  // Public / Landing
  LANDING: '/',
  FAQ: '/faq',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // App (authenticated - Intern)
  DASHBOARD: '/dashboard',
  ANALYTICS: '/dashboard/analytics',
  ANALYTICS_COMPARE: '/dashboard/analytics/compare',
  ANALYTICS_DRILLDOWN: '/dashboard/analytics/drilldown/:type',
  PROJECTS: '/dashboard/projects',
  TASKS: '/dashboard/tasks',
  TASK_DETAILS: '/dashboard/tasks/:taskId',
  ONBOARDING: '/dashboard/onboarding',
  ONBOARDING_DETAILS: '/dashboard/onboarding/:stepId',
  REVIEWS: '/dashboard/reviews',
  REVIEW_DETAILS: '/dashboard/reviews/:reviewId',
  NOTIFICATIONS: '/dashboard/notifications',
  TEAM: '/dashboard/team',
  REPORTS: '/dashboard/reports',
  REPORTS_BUILDER: '/dashboard/reports/builder',
  REPORTS_SAVED: '/dashboard/reports/saved',
  REPORTS_EXPORT: '/dashboard/reports/export',
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',

  // Supervisor Routes
  SUPERVISOR_DASHBOARD: '/supervisor/dashboard',
  SUPERVISOR_INTERNS: '/supervisor/interns',
  SUPERVISOR_INTERN_DETAILS: '/supervisor/interns/:internId',
  SUPERVISOR_TASKS: '/supervisor/tasks',
  SUPERVISOR_REVIEWS: '/supervisor/reviews',
  SUPERVISOR_ONBOARDING: '/supervisor/onboarding',
  SUPERVISOR_REPORTS: '/supervisor/reports',
  SUPERVISOR_REPORTS_BUILDER: '/supervisor/reports/builder',
  SUPERVISOR_REPORTS_SAVED: '/supervisor/reports/saved',
  SUPERVISOR_REPORTS_EXPORT: '/supervisor/reports/export',
  SUPERVISOR_ANALYTICS_COMPARE: '/supervisor/analytics/compare',
  SUPERVISOR_ANALYTICS_DRILLDOWN: '/supervisor/analytics/drilldown/:type',
  SUPERVISOR_NOTIFICATIONS: '/supervisor/notifications',
  SUPERVISOR_PROFILE: '/supervisor/profile',
  SUPERVISOR_SETTINGS: '/supervisor/settings',

  // HR Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_INTERNS: '/admin/interns',
  ADMIN_INTERN_DETAILS: '/admin/interns/:internId',
  ADMIN_SUPERVISORS: '/admin/supervisors',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ANNOUNCEMENTS: '/admin/announcements',
  ADMIN_BATCHES: '/admin/batches',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORTS_BUILDER: '/admin/reports/builder',
  ADMIN_REPORTS_SAVED: '/admin/reports/saved',
  ADMIN_REPORTS_EXPORT: '/admin/reports/export',
  ADMIN_ANALYTICS_COMPARE: '/admin/analytics/compare',
  ADMIN_ANALYTICS_DRILLDOWN: '/admin/analytics/drilldown/:type',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_NOTIFICATIONS: '/admin/notifications',

  // Department Head Routes
  DEPARTMENT_HEAD_DASHBOARD: '/department-head',
  DEPARTMENT_HEAD_INTERNS: '/department-head/interns',
  DEPARTMENT_HEAD_SUPERVISORS: '/department-head/supervisors',
  DEPARTMENT_HEAD_TASKS: '/department-head/tasks',
  DEPARTMENT_HEAD_REVIEWS: '/department-head/reviews',
  DEPARTMENT_HEAD_ANALYTICS: '/department-head/analytics',
  DEPARTMENT_HEAD_APPROVALS: '/department-head/approvals',
  DEPARTMENT_HEAD_ANNOUNCEMENTS: '/department-head/announcements',
  DEPARTMENT_HEAD_NOTIFICATIONS: '/department-head/notifications',
  DEPARTMENT_HEAD_PROFILE: '/department-head/profile',
  DEPARTMENT_HEAD_SETTINGS: '/department-head/settings',

  // Catch-all
  NOT_FOUND: '*',
};


