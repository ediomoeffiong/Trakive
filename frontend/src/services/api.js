/**
 * @file api.js
 * @description Centralised Axios instance with interceptors for Trakive.
 * All service modules should import from this file, not directly from axios.
 */

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

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

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getBearerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return error rejection to calling services cleanly without hard-redirecting to /login
    return Promise.reject(error);
  },
);

export default api;
