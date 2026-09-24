/**
 * @file errorHandling.js
 * @description Centralised error handling, message sanitization, and session expiry management.
 * Transforms technical/internal backend error messages into end-user-friendly notifications
 * and coordinates graceful session termination.
 */

import toast from 'react-hot-toast';
import { clearAuthTokens } from './authSession';
import { useAppStore } from '../store/useAppStore';

let isLoggingOut = false;
let sessionToastShownAt = 0;

/**
 * Sanitizes technical, backend, or network error messages into friendly user-facing text.
 * @param {string} rawMessage - Raw message from backend or error object
 * @param {string} fallback - Default user-facing fallback message
 * @returns {string} Clean, friendly error message
 */
export const sanitizeErrorMessage = (rawMessage, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!rawMessage || typeof rawMessage !== 'string') return fallback;

  const msg = rawMessage.trim();

  // Session / Token Expiry
  if (
    /refresh token/i.test(msg) ||
    /token.*expired/i.test(msg) ||
    /jwt expired/i.test(msg) ||
    /expired.*token/i.test(msg) ||
    /status code 401/i.test(msg)
  ) {
    return 'Your session has expired. Please log in again to continue.';
  }

  // Token invalid / signature / malformed
  if (
    /jwt malformed/i.test(msg) ||
    /invalid token/i.test(msg) ||
    /token.*invalid/i.test(msg) ||
    /invalid.*signature/i.test(msg)
  ) {
    return 'Your session is no longer valid. Please log in again to continue.';
  }

  // Authentication required / unauthorized
  if (
    /authentication required/i.test(msg) ||
    /no token provided/i.test(msg) ||
    /unauthorized/i.test(msg) ||
    /not authenticated/i.test(msg)
  ) {
    return 'Please log in to continue.';
  }

  // Permission / Forbidden
  if (
    /forbidden/i.test(msg) ||
    /access denied/i.test(msg) ||
    /insufficient permission/i.test(msg) ||
    /status code 403/i.test(msg)
  ) {
    return 'You do not have permission to perform this action.';
  }

  // Network / Connection errors
  if (
    /network error/i.test(msg) ||
    /failed to fetch/i.test(msg) ||
    /timeout/i.test(msg) ||
    /econnrefused/i.test(msg) ||
    /network connection/i.test(msg)
  ) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  // Not found
  if (/not found/i.test(msg) || /status code 404/i.test(msg)) {
    return 'The requested information could not be found.';
  }

  // Validation GUID / UUID mismatches
  if (/must be a valid guid/i.test(msg) || /must be a valid uuid/i.test(msg)) {
    return 'Invalid selection. Please choose a valid item.';
  }

  // Internal Server Errors (500)
  if (/internal server error/i.test(msg) || /status code 500/i.test(msg)) {
    return 'Our server encountered an issue. Please try again shortly.';
  }

  return msg;
};

/**
 * Extracts and formats a user-friendly error from an Axios or generic Error object.
 * @param {Error|object} err - Error object
 * @param {string} fallback - Fallback message
 * @returns {string} Sanitized user-facing message
 */
export const formatUserFriendlyError = (err, fallback = 'Something went wrong. Please try again.') => {
  const raw =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;
  return sanitizeErrorMessage(raw, fallback);
};

/**
 * Coordinates graceful logout and redirection when a user's session is expired or invalid.
 * Prevents multiple simultaneous redirects or toast flooding.
 * @param {string} [customMessage] - Optional custom toast message
 */
export const handleSessionExpired = (customMessage) => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  const message = customMessage || 'Your session has expired. Please log in again to continue.';

  // Purge all tokens and auth state
  clearAuthTokens();
  try {
    useAppStore.getState()?.clearAuth();
  } catch {}

  // Show a single debounced toast
  const now = Date.now();
  if (now - sessionToastShownAt > 5000) {
    sessionToastShownAt = now;
    try {
      toast.error(message, { id: 'trakive-session-expired', duration: 4000 });
    } catch {}
  }

  // Redirect to login if user is currently on a protected route
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 600);
  }
};

/**
 * Resets the session expiry guard flag after successful login.
 */
export const resetSessionExpiredFlag = () => {
  isLoggingOut = false;
  sessionToastShownAt = 0;
};
