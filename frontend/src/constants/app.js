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
  ACCESS_TOKEN: 'trakive_access_token',
  REFRESH_TOKEN: 'trakive_refresh_token',
  USER: 'trakive_user',
  SIDEBAR_COLLAPSED: 'trakive_sidebar_collapsed',
  THEME: 'trakive_theme',
};

const API_PREFIX = '/api/v1';

const stripTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '');

/**
 * Ensure the client always talks to the versioned API.
 * Production env is often set to the Render origin without `/api/v1`, which
 * produces 404s like POST /auth/login instead of POST /api/v1/auth/login.
 */
export const resolveApiBaseUrl = (
  raw = import.meta.env.VITE_API_BASE_URL,
  { isProd = import.meta.env.PROD } = {}
) => {
  const value = stripTrailingSlashes(raw);
  if (!value) {
    return isProd ? API_PREFIX : `http://localhost:5000${API_PREFIX}`;
  }
  if (value.endsWith(API_PREFIX) || value.endsWith('/api/v1')) {
    return value;
  }
  if (value.endsWith('/api')) {
    return `${value}/v1`;
  }
  return `${value}${API_PREFIX}`;
};

/** API base URL — pulled from env, uses localhost only during local dev. */
export const API_BASE_URL = resolveApiBaseUrl();

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
