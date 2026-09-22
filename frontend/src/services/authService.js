/**
 * @file authService.js
 * @description Mock authentication service to simulate API requests with artificial latency.
 */

import api from './api';
import { mockUsers, DEFAULT_MOCK_PASSWORD } from '../data/mockUsers';
import { normalizeDepartmentForPerson, normalizePersonRecord } from '../utils/people';
import { isOrganizationEmail, ORG_EMAIL_REQUIRED_MESSAGE } from '../utils/helpers';

const MOCK_AUTH_ENABLED = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';
const CUSTOM_USERS_KEY = 'trakive_custom_users';
const PASSWORD_OVERRIDES_KEY = 'trakive_mock_password_overrides';
const PENDING_RESET_EMAIL_KEY = 'trakive_pending_reset_email';

const safeParseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// Helper to get all users (mock users + registered users from localStorage)
const getRegisteredUsers = () => {
  const customUsers = safeParseJson(localStorage.getItem(CUSTOM_USERS_KEY), []);
  return [...mockUsers, ...customUsers];
};

// Helper to save a custom registered user
const saveCustomUser = (user) => {
  const customUsers = safeParseJson(localStorage.getItem(CUSTOM_USERS_KEY), []);
  customUsers.push(user);
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(customUsers));
};

const getMockPasswordOverrides = () =>
  safeParseJson(localStorage.getItem(PASSWORD_OVERRIDES_KEY), {});

const saveMockPasswordOverrides = (overrides) => {
  localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
};

const getExpectedMockPassword = (user) => {
  const email = String(user?.email || '').toLowerCase();
  const overrides = getMockPasswordOverrides();
  return overrides[email] || user?.mockPassword || DEFAULT_MOCK_PASSWORD;
};

const updateStoredMockPassword = (email, password) => {
  const normalizedEmail = String(email || '').toLowerCase();
  const customUsers = safeParseJson(localStorage.getItem(CUSTOM_USERS_KEY), []);
  const updatedUsers = customUsers.map((user) =>
    String(user.email || '').toLowerCase() === normalizedEmail
      ? { ...user, mockPassword: password }
      : user
  );

  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(updatedUsers));

  const overrides = getMockPasswordOverrides();
  overrides[normalizedEmail] = password;
  saveMockPasswordOverrides(overrides);
};

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

const getApiErrorMessage = (err, fallback) =>
  err.response?.data?.message ||
  err.response?.data?.error ||
  err.message ||
  fallback;

const splitName = (name = '') => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'User',
    lastName: parts.slice(1).join(' ') || 'User',
  };
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const assertJsonApiResponse = (res, fallback) => {
  if (!res.data || typeof res.data !== 'object') {
    throw new Error(fallback);
  }
};

const normalizeBackendAuthPayload = (res, email) => {
  assertJsonApiResponse(res, 'Invalid response from authentication server');
  const payload = res.data?.data || res.data || {};
  const user = payload.user || payload;
  const tokens = payload.tokens || {};
  const token = tokens.accessToken || payload.token || user.token;
  const safeUser = normalizeUser(user, email || user.email, token, tokens);

  return {
    success: res.data?.success ?? true,
    message: res.data?.message || payload.message,
    user: safeUser,
    token,
    refreshToken: tokens.refreshToken,
    resetToken: payload.resetToken,
    emailVerificationToken: payload.emailVerificationToken,
  };
};

const normalizeRole = (role = '') => {
  const value = String(role || '').toLowerCase();
  if (value === 'supervisor') return 'Supervisor';
  if (value === 'intern') return 'Intern';
  if (value === 'hr' || value === 'hr_admin' || value === 'hr administrator') return 'HR Administrator';
  if (value === 'head' || value === 'department_head' || value === 'department head') return 'Department Head';
  return role || 'Intern';
};

const normalizeUser = (user, email, token, tokens = {}) => {
  if (!user || typeof user !== 'object') return null;
  const safeSourceUser = { ...user };
  delete safeSourceUser.mockPassword;
  const name = user.name || `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || email.split('@')[0];
  const department = normalizeDepartmentForPerson({ ...user, name, email: user.email || email }, user.department_name || user.department || '');
  const dateOfBirth = toDateInputValue(user.dateOfBirth || user.date_of_birth);
  return normalizePersonRecord({
    ...safeSourceUser,
    id: user.id || user.user_id,
    name,
    firstName: user.firstName || user.first_name || name.split(/\s+/)[0] || '',
    lastName: user.lastName || user.last_name || name.split(/\s+/).slice(1).join(' ') || '',
    email: user.email || email,
    avatarUrl: user.avatarUrl || user.avatar_url || user.avatar || null,
    dateOfBirth,
    date_of_birth: dateOfBirth,
    department,
    department_name: user.department_name || department,
    organization: user.organization_name || user.organization || '',
    organization_name: user.organization_name || user.organization || '',
    role: normalizeRole(user.role || user.role_name),
    token,
    accessToken: token,
    refreshToken: tokens.refreshToken,
    isFirstLogin: Boolean(user.isFirstLogin),
    hasCompletedOnboarding: user.hasCompletedOnboarding ?? normalizeRole(user.role || user.role_name) !== 'Intern',
    profileCompleted: user.profileCompleted ?? normalizeRole(user.role || user.role_name) !== 'Intern',
  });
};

const getMockLogin = async (email, password) => {
  await delay(800);
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || password !== getExpectedMockPassword(user)) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const currentKey = `trakive_settings_${user.id}_current_sessions`;
  const storedCurrent = safeParseJson(localStorage.getItem(currentKey), null);
  if (storedCurrent && Array.isArray(storedCurrent)) {
    const otherActiveDevices = storedCurrent.filter((s) => !s.isCurrent);
    if (otherActiveDevices.length >= 3) {
      throw new Error('Maximum active device limit reached (3 devices). Please log out from one of your active devices before logging in.');
    }
  }

  const token = `mock-jwt-token-for-${user.id}`;
  return {
    user: normalizeUser(user, email, token),
    token,
  };
};

export const authService = {
  /**
   * Login validating email and password via backend API with fallback.
   */
  login: async ({ email, password }) => {
    if (!isOrganizationEmail(email)) {
      throw new Error(ORG_EMAIL_REQUIRED_MESSAGE);
    }
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data?.data || res.data || {};
      const user = payload.user || payload;
      const tokens = payload.tokens || {};
      const token = tokens.accessToken || payload.token || user.token;
      const safeUser = normalizeUser(user, email, token, tokens);

      if (!safeUser?.id || !token) throw new Error('Invalid login response from server');

      return {
        user: safeUser,
        token,
        refreshToken: tokens.refreshToken,
      };
    } catch (err) {
      if (!MOCK_AUTH_ENABLED) {
        const backendMsg = err.response?.data?.message || err.response?.data?.error;
        throw new Error(backendMsg || err.message || 'Login failed. Please try again.');
      }

      // If backend responded with explicit auth failure message
      const backendMsg = err.response?.data?.message || err.response?.data?.error;
      if (backendMsg) {
        const demoUser = getRegisteredUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (demoUser && password === getExpectedMockPassword(demoUser)) {
          return getMockLogin(email, password);
        }
        throw new Error(backendMsg);
      }

      // Fallback for offline/mock development
      return getMockLogin(email, password);
    }
  },

  /**
   * Register with the backend in production, with mock fallback for local/demo use.
   */
  register: async (data) => {
    if (!isOrganizationEmail(data.email)) {
      throw new Error(ORG_EMAIL_REQUIRED_MESSAGE);
    }
    const { firstName, lastName } = splitName(data.name);
    const backendPayload = {
      email: data.email,
      password: data.password,
      first_name: data.first_name || data.firstName || firstName,
      last_name: data.last_name || data.lastName || lastName,
      role: normalizeRole(data.role).toLowerCase().replace(/\s+/g, '_').replace('hr_administrator', 'hr'),
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || data.dateOfBirth || null,
      department_id: data.department_id || null,
    };

    try {
      const res = await api.post('/auth/register', backendPayload);
      const result = normalizeBackendAuthPayload(res, data.email);
      if (!result.user?.id) {
        throw new Error('Invalid registration response from authentication server');
      }
      return result;
    } catch (err) {
      if (!MOCK_AUTH_ENABLED) {
        throw new Error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
      }
    }

    await delay(1500);
    const users = getRegisteredUsers();
    
    // Check if email already registered
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email address already exists.');
    }

    const isSupervisor = data.role === 'Supervisor' || data.role === 'supervisor';
    const role = isSupervisor ? 'Supervisor' : 'Intern';

    const newUser = {
      id: `custom-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: role,
      department: data.department || '',
      phone: data.phone || '',
      dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
      startDate: isSupervisor ? '' : (data.startDate || ''),
      endDate: isSupervisor ? '' : (data.endDate || ''),
      datesVerified: isSupervisor ? true : false,
      dateVerificationStatus: isSupervisor ? 'N/A' : 'Pending Supervisor Verification',
      supervisorId: null,
      supervisorName: null,
      supervisorEmail: null,
      secondarySupervisorId: null,
      secondarySupervisorName: null,
      avatarUrl: null,
      hasCustomAvatar: false,
      bio: '',
      isFirstLogin: true,
      hasCompletedOnboarding: isSupervisor ? true : false,
      profileCompleted: false,
      isNewUser: true,
      mockPassword: data.password,
      createdAt: new Date().toISOString(),
    };

    saveCustomUser(newUser);

    // Save initial metadata for this user
    localStorage.setItem(`trakive_user_meta_${newUser.id}`, JSON.stringify({
      isFirstLogin: true,
      hasCompletedOnboarding: isSupervisor ? true : false,
      profileCompleted: false,
      datesVerified: isSupervisor ? true : false,
      dateVerificationStatus: isSupervisor ? 'N/A' : 'Pending Supervisor Verification',
      supervisorName: newUser.supervisorName,
      secondarySupervisorName: null,
    }));

    return {
      success: true,
      message: 'Registration successful. Verification email sent.',
      user: newUser,
    };
  },

  /**
   * Request a real backend password reset token/link in production.
   */
  forgotPassword: async ({ email }) => {
    if (!isOrganizationEmail(email)) {
      throw new Error(ORG_EMAIL_REQUIRED_MESSAGE);
    }
    try {
      const res = await api.post('/auth/forgot-password', { email });
      assertJsonApiResponse(res, 'Invalid response from authentication server');
      const payload = res.data?.data || {};
      return {
        success: res.data?.success ?? true,
        message: res.data?.message || 'Password reset link sent to your email address.',
        resetToken: payload.resetToken,
        resetEmail: email,
      };
    } catch (err) {
      if (!MOCK_AUTH_ENABLED) {
        throw new Error(getApiErrorMessage(err, 'Password reset request failed. Please try again.'));
      }
    }

    await delay(1000);
    const users = getRegisteredUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!exists) {
      throw new Error('No account found with this email address.');
    }

    localStorage.setItem(PENDING_RESET_EMAIL_KEY, email.toLowerCase());

    return {
      success: true,
      message: 'Password reset link sent to your email address.',
      resetEmail: email,
    };
  },

  /**
   * Reset a real backend password in production.
   */
  resetPassword: async ({ password, email, token }) => {
    if (token) {
      try {
        const res = await api.post('/auth/reset-password', {
          token,
          newPassword: password,
        });
        assertJsonApiResponse(res, 'Invalid response from authentication server');
        return {
          success: res.data?.success ?? true,
          message: res.data?.message || 'Password has been reset successfully.',
        };
      } catch (err) {
        if (!MOCK_AUTH_ENABLED) {
          throw new Error(getApiErrorMessage(err, 'Password reset failed. Please try again.'));
        }
      }
    } else if (!MOCK_AUTH_ENABLED) {
      throw new Error('Invalid or missing password reset token. Please request a new reset link.');
    }

    await delay(1200);
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    const resetEmail = email || localStorage.getItem(PENDING_RESET_EMAIL_KEY);
    if (!resetEmail) {
      throw new Error('Please request a password reset before setting a new password.');
    }

    const users = getRegisteredUsers();
    const exists = users.some((u) => u.email.toLowerCase() === resetEmail.toLowerCase());
    if (!exists) {
      throw new Error('No account found for this password reset.');
    }

    updateStoredMockPassword(resetEmail, password);
    localStorage.removeItem(PENDING_RESET_EMAIL_KEY);

    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  },

  /**
   * Mock Resend Email Verification.
   */
  resendVerificationEmail: async (_email) => {
    await delay(1000);
    return {
      success: true,
      message: 'Verification link resent to your email address.',
    };
  },

  /**
   * Mock Logout.
   */
  logout: async () => {
    await delay(500);
    return { success: true };
  },
};
