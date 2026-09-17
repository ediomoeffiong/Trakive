/**
 * @file api.js
 * @description Centralised Axios instance with interceptors for Trakive.
 * All service modules should import from this file, not directly from axios.
 */

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

const joinUrl = (base, path) => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanBase = String(base || '').replace(/\/+$/, '');
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to safely extract Bearer token string
const getBearerToken = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!raw) return null;
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      const userToken = parsed?.state?.user?.token;
      if (userToken) return userToken;
      return null;
    }
    return raw;
  } catch {
    return null;
  }
};

const getPersistedAuthState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!raw || !raw.startsWith('{')) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getRefreshToken = () => {
  const parsed = getPersistedAuthState();
  return parsed?.state?.user?.refreshToken || null;
};

const persistTokenPair = ({ accessToken, refreshToken }) => {
  const parsed = getPersistedAuthState();
  const user = parsed?.state?.user;
  if (!parsed?.state || !user || !accessToken) return;

  parsed.state.user = {
    ...user,
    token: accessToken,
    accessToken,
    refreshToken: refreshToken || user.refreshToken,
  };
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(parsed));
};

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getBearerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Axios 1.x URL combining can drop `/api/v1` when the path starts with `/`.
    if (config.baseURL && config.url && !/^https?:\/\//i.test(config.url)) {
      config.url = joinUrl(config.baseURL, config.url);
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
          persistTokenPair(tokens || {});
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
