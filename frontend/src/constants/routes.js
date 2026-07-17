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

  // App (authenticated)
  DASHBOARD: '/dashboard',
  ANALYTICS: '/dashboard/analytics',
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
  SETTINGS: '/dashboard/settings',
  PROFILE: '/dashboard/profile',

  // Catch-all
  NOT_FOUND: '*',
};
