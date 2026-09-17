/**
 * @file api.js
 * @description Centralised Axios instance with interceptors for Trakive.
 * All service modules should import from this file, not directly from axios.
 */

import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { getAccessToken, getRefreshToken, persistTokenPairInStore } from '../utils/authSession';

const joinUrl = (base, path) => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanBase = String(base || '').replace(/\/+$/, '');
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

const api = axios.create({
  // Requests are resolved to absolute URLs in the interceptor below. Keeping
  // baseURL empty avoids production bundles or Axios URL merging from dropping
  // the `/api/v1` prefix when a service passes paths like `/projects`.
  baseURL: undefined,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

let refreshPromise = null;

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message || '';
    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      /expired/i.test(message);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        api.post('/auth/refresh', { refreshToken }).then((response) => {
          const tokens = response.data?.data?.tokens || response.data?.tokens;
          persistTokenPairInStore(tokens || {});
          return tokens;
        }).finally(() => {
          refreshPromise = null;
        });

      const tokens = await refreshPromise;
      if (!tokens?.accessToken) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default api;
