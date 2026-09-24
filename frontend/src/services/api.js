/**
 * @file api.js
 * @description Centralised Axios instance with intelligent token refreshing,
 * proactive JWT expiry interception, and graceful session expiry handling for Trakive.
 */

import axios from 'axios';
import { API_BASE_URL } from '../constants';
import {
  getAccessToken,
  getRefreshToken,
  persistTokenPairInStore,
  isTokenExpired,
  isRealBackendToken,
} from '../utils/authSession';
import { handleSessionExpired, formatUserFriendlyError } from '../utils/errorHandling';

const joinUrl = (base, path) => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanBase = String(base || '').replace(/\/+$/, '');
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

let refreshPromise = null;
let isSessionExpired = false;

export const resetApiSessionState = () => {
  isSessionExpired = false;
  refreshPromise = null;
};

const getOrRefreshToken = (refreshToken) => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        joinUrl(API_BASE_URL, '/auth/refresh'),
        { refreshToken },
        { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
      )
      .then((response) => {
        const tokens = response.data?.data?.tokens || response.data?.tokens;
        if (!tokens?.accessToken) {
          throw new Error('Invalid token response from refresh');
        }
        persistTokenPairInStore(tokens);
        return tokens.accessToken;
      })
      .catch((err) => {
        isSessionExpired = true;
        handleSessionExpired();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const api = axios.create({
  baseURL: undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // If the session has already expired, avoid making further authenticated network calls
    if (isSessionExpired) {
      return Promise.reject(new Error('Your session has expired. Please log in again to continue.'));
    }

    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/forgot-password') ||
      config.url?.includes('/auth/reset-password');

    let token = getAccessToken();

    // Proactively check if access token is expired before sending request
    if (!isAuthEndpoint && token && isTokenExpired(token)) {
      const refreshToken = getRefreshToken();
      if (isRealBackendToken(refreshToken) && !isTokenExpired(refreshToken, 0)) {
        try {
          token = await getOrRefreshToken(refreshToken);
        } catch {
          return Promise.reject(new Error('Your session has expired. Please log in again to continue.'));
        }
      } else {
        isSessionExpired = true;
        handleSessionExpired();
        return Promise.reject(new Error('Your session has expired. Please log in again to continue.'));
      }
    }

    if (token) {
      // In production or when communicating with remote backend, do not send mock tokens
      const isRemote = /^https?:\/\//i.test(config.url || '') && !config.url?.includes('localhost');
      if (token.startsWith('mock-') && isRemote) {
        // Skip attaching mock token to remote backends
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    if (config.url && !/^https?:\/\//i.test(config.url)) {
      config.url = joinUrl(config.baseURL || API_BASE_URL, config.url);
      config.baseURL = undefined;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Handle 401 Unauthorized
    if (status === 401) {
      // 1. If login failed with 401, return sanitized error without logging out
      if (url.includes('/auth/login')) {
        error.message = formatUserFriendlyError(error, 'Invalid email or password. Please try again.');
        return Promise.reject(error);
      }

      // 2. If refresh request itself failed with 401 or request already retried: session is dead
      if (url.includes('/auth/refresh') || originalRequest?._retry) {
        isSessionExpired = true;
        handleSessionExpired();
        error.message = 'Your session has expired. Please log in again to continue.';
        return Promise.reject(error);
      }

      // 3. Attempt token refresh if a real refresh token is available
      const refreshToken = getRefreshToken();
      if (isRealBackendToken(refreshToken) && !isTokenExpired(refreshToken, 0)) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await getOrRefreshToken(refreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          error.message = 'Your session has expired. Please log in again to continue.';
          return Promise.reject(error);
        }
      }

      // No viable refresh token available; log out cleanly
      isSessionExpired = true;
      handleSessionExpired();
      error.message = 'Your session has expired. Please log in again to continue.';
      return Promise.reject(error);
    }

    // Sanitize any other error message
    error.message = formatUserFriendlyError(error);
    return Promise.reject(error);
  },
);

export default api;
