/**
 * @file authService.js
 * @description Mock authentication service to simulate API requests with artificial latency.
 */

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
   * Mock login validating email and password.
   */
  login: async ({ email, password }) => {
    await delay(1200);
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password. Please try again.');
    }

    // For mock testing, allow DEFAULT_MOCK_PASSWORD or 'password123' or any password for custom registered users.
    const isMockDefault = password === DEFAULT_MOCK_PASSWORD || password === 'password123';
    const isCustomMatch = user.id.startsWith('custom-') && password.length >= 8;

    if (!isMockDefault && !isCustomMatch) {
      throw new Error('Invalid credentials. (Hint: use "Password123!" for mock accounts)');
    }

    const { ...safeUser } = user;
    return {
      user: safeUser,
      token: `mock-jwt-token-for-${user.id}`,
    };
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

    const newUser = {
      id: `custom-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'Intern', // Default role for registering
      department: data.department || 'General',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`,
      bio: 'New Intern onboarding via registration.',
    };

    saveCustomUser(newUser);

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
