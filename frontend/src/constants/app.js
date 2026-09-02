/**
 * @file app.js
 * @description App-wide constants for Trakive.
 */

export const APP_NAME = 'Trakive';
export const APP_VERSION = '1.0.0';

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20;

/** Local-storage / cookie keys */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'trakive_auth_token',
  REFRESH_TOKEN: 'trakive_refresh_token',
  USER: 'trakive_user',
  SIDEBAR_COLLAPSED: 'trakive_sidebar_collapsed',
  THEME: 'trakive_theme',
};

/** API base URL — pulled from env, falls back to localhost */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/** Supported themes */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/** User Roles */
export const USER_ROLES = {
  INTERN: 'Intern',
  SUPERVISOR: 'Supervisor',
  HR_ADMIN: 'HR Administrator',
  DEPARTMENT_HEAD: 'Department Head',
};

/** Department Head frontend permission matrix */
export const DEPARTMENT_HEAD_PERMISSIONS = {
  viewDepartment: true,
  viewInterns: true,
  manageInterns: false,
  viewSupervisors: true,
  manageSupervisors: false,
  viewTasks: true,
  manageTasks: false,
  viewReviews: true,
  manageReviews: false,
  approveDepartmentRequests: true,
  createAnnouncements: true,
  viewAnalytics: true,
  manageOrganization: false,
};
