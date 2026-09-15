/**
 * @file authService.js
 * @description Mock authentication service to simulate API requests with artificial latency.
 */

import api from './api';
import { mockUsers, DEFAULT_MOCK_PASSWORD } from '../data/mockUsers';

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

export const authService = {
  /**
   * Login validating email and password via backend API with fallback.
   */
  login: async ({ email, password }) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = res.data?.data || res.data || {};
      const user = payload.user || payload;
      const tokens = payload.tokens || {};
      const token = tokens.accessToken || payload.token || user.token;

      let role = user.role || user.role_name || 'Intern';
      if (role.toLowerCase() === 'supervisor') role = 'Supervisor';
      if (role.toLowerCase() === 'intern') role = 'Intern';
      if (role.toLowerCase() === 'hr' || role.toLowerCase() === 'hr_admin') role = 'HR Administrator';
      if (role.toLowerCase() === 'head' || role.toLowerCase() === 'department_head') role = 'Department Head';

      const safeUser = {
        ...user,
        id: user.id || user.user_id,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || email.split('@')[0],
        email: user.email || email,
        avatarUrl: user.avatarUrl || user.avatar_url || user.avatar || null,
        role,
        token,
        accessToken: token,
        refreshToken: tokens.refreshToken,
        isFirstLogin: false,
        hasCompletedOnboarding: true,
        profileCompleted: true,
      };

      return {
        user: safeUser,
        token,
      };
    } catch (err) {
      // If backend responded with explicit auth failure message
      const backendMsg = err.response?.data?.message || err.response?.data?.error;
      if (backendMsg) {
        throw new Error(backendMsg);
      }

      // Fallback for offline/mock development
      await delay(800);
      const users = getRegisteredUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw new Error('Invalid email or password. Please try again.');
      }

      const safeUser = {
        ...user,
        role: user.role === 'supervisor' ? 'Supervisor' : user.role,
        avatarUrl: user.avatarUrl || user.avatar_url || user.avatar || null,
        token: `mock-jwt-token-for-${user.id}`,
      };

      return {
        user: safeUser,
        token: safeUser.token,
      };
    }
  },

  /**
   * Mock register.
   */
  register: async (data) => {
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
