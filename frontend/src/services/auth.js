/**
 * @file auth.js
 * @description Authentication service — wraps API calls for login/register/logout.
 * Business logic not yet implemented; structure is ready.
 */

import api from './api';

export const authService = {
  /**
   * Login user with email + password.
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => api.post('/auth/login', credentials),

  /**
   * Register a new user account.
   * @param {{ name: string, email: string, password: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Request a password-reset email.
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  /**
   * Logout the current user (server-side token invalidation).
   */
  logout: () => api.post('/auth/logout'),

  /**
   * Refresh the access token using the stored refresh token.
   * @param {{ refresh_token: string }} data
   */
  refreshToken: (data) => api.post('/auth/refresh', data),
};
