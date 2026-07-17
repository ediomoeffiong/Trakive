/**
 * @file useAppStore.js
 * @description Root Zustand store for Trakive.
 * Feature slices will be added as the app grows; this file wires them together.
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';
import { authService } from '../services';

// ── UI / Shell Slice ──────────────────────────────────────────────────────────
const createUISlice = (set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  theme: 'light',
  setTheme: (theme) => set({ theme }),
});

// ── Auth Slice ────────────────────────────────────────────────────────────────
const createAuthSlice = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clearAuth: () => set({ user: null, isAuthenticated: false, error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      // We don't automatically log them in, they will go to the verification page
      set({ isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      get().clearAuth();
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.forgotPassword({ email });
      set({ isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resetPassword(data);
      set({ isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  resendVerificationEmail: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resendVerificationEmail(email);
      set({ isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
});

// ── Combined Store ────────────────────────────────────────────────────────────
export const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...createUISlice(set, get),
        ...createAuthSlice(set, get),
      }),
      {
        name: STORAGE_KEYS.AUTH_TOKEN,
        // Only persist these keys to localStorage
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'TrakiveStore' },
  ),
);

// ── Typed Selectors (use instead of raw store for performance) ────────────────
export const useSidebarCollapsed = () =>
  useAppStore((s) => s.sidebarCollapsed);
export const useToggleSidebar = () => useAppStore((s) => s.toggleSidebar);
export const useCurrentUser = () => useAppStore((s) => s.user);
export const useIsAuthenticated = () => useAppStore((s) => s.isAuthenticated);
export const useTheme = () => useAppStore((s) => s.theme);
export const useAuthLoading = () => useAppStore((s) => s.isLoading);
export const useAuthError = () => useAppStore((s) => s.error);
