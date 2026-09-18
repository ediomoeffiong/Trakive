/**
 * @file authService.js
 * @description Mock authentication service to simulate API requests with artificial latency.
 */

import api from './api';
import { mockUsers, DEFAULT_MOCK_PASSWORD } from '../data/mockUsers';
import { normalizeDepartmentForPerson, normalizePersonRecord } from '../utils/people';
import { isOrganizationEmail, ORG_EMAIL_REQUIRED_MESSAGE } from '../utils/helpers';

const MOCK_AUTH_ENABLED = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

// Helper to get all users (mock users + registered users from localStorage)
const getRegisteredUsers = () => {
  const customUsersJson = localStorage.getItem('trakive_custom_users');
  const customUsers = customUsersJson ? JSON.parse(customUsersJson) : [];
  return [...mockUsers, ...customUsers];
};

// Helper to save a custom registered user
const saveCustomUser = (user) => {
  const customUsersJson = localStorage.getItem('trakive_custom_users');
  const customUsers = customUsersJson ? JSON.parse(customUsersJson) : [];
  customUsers.push(user);
  localStorage.setItem('trakive_custom_users', JSON.stringify(customUsers));
};

const delay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const name = user.name || `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() || email.split('@')[0];
  const department = normalizeDepartmentForPerson({ ...user, name, email: user.email || email }, user.department_name || user.department || '');
  return normalizePersonRecord({
    ...user,
    id: user.id || user.user_id,
    name,
    firstName: user.firstName || user.first_name || name.split(/\s+/)[0] || '',
    lastName: user.lastName || user.last_name || name.split(/\s+/).slice(1).join(' ') || '',
    email: user.email || email,
    avatarUrl: user.avatarUrl || user.avatar_url || user.avatar || null,
    department,
    department_name: user.department_name || department,
    organization: user.organization_name || user.organization || '',
    organization_name: user.organization_name || user.organization || '',
    role: normalizeRole(user.role || user.role_name),
    token,
    accessToken: token,
    refreshToken: tokens.refreshToken,
    isFirstLogin: Boolean(user.isFirstLogin),
    hasCompletedOnboarding: user.hasCompletedOnboarding ?? true,
    profileCompleted: user.profileCompleted ?? true,
  });
};

const getMockLogin = async (email, password) => {
  await delay(800);
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || password !== DEFAULT_MOCK_PASSWORD) {
    throw new Error('Invalid email or password. Please try again.');
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
        const isDemoAccount = mockUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (isDemoAccount && password === DEFAULT_MOCK_PASSWORD) {
          return getMockLogin(email, password);
        }
        throw new Error(backendMsg);
      }

      // Fallback for offline/mock development
      return getMockLogin(email, password);
    }
  },

  /**
   * Mock register.
   */
  register: async (data) => {
    if (!isOrganizationEmail(data.email)) {
      throw new Error(ORG_EMAIL_REQUIRED_MESSAGE);
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
   * Mock Forgot Password.
   */
  forgotPassword: async ({ email }) => {
    if (!isOrganizationEmail(email)) {
      throw new Error(ORG_EMAIL_REQUIRED_MESSAGE);
    }
    await delay(1000);
    const users = getRegisteredUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!exists) {
      throw new Error('No account found with this email address.');
    }

    return {
      success: true,
      message: 'Password reset link sent to your email address.',
    };
  },

  /**
   * Mock Reset Password.
   */
  resetPassword: async ({ password }) => {
    await delay(1200);
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    return {
      success: true,
      message: 'Password has been reset successfully.',
    };
  },

  /**
   * Mock Resend Email Verification.
   */
  resendVerificationEmail: async (email) => {
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
