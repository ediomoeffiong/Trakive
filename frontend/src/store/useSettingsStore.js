/**
 * @file useSettingsStore.js
 * @description Dedicated Zustand store for Trakive's Settings & Preferences module.
 *
 * Architecture note: All service calls go through settingsService so that switching
 * from mock to real API requires only updating that service file.
 *
 * The store manages:
 *  - Account settings (name, username, email, phone)
 *  - Security settings (2FA, OAuth, last password change)
 *  - Active sessions
 *  - Notification preferences
 *  - Appearance (theme, spacing, sidebar)
 *  - Privacy settings
 *  - Accessibility settings
 *  - Language & region settings
 *  - Role-specific preferences
 *  - Unsaved changes dirty flag
 */

import { create } from 'zustand';
import { settingsService } from '../services/settingsService';
import { defaultSettings } from '../data/settings';

// ── Deep clone helper ─────────────────────────────────────────────────────────
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ── Store ─────────────────────────────────────────────────────────────────────
export const useSettingsStore = create((set, get) => ({
  // ── Data State ──────────────────────────────────────────────────────────────
  settings:         clone(defaultSettings), // live draft (editable)
  pristineSettings: clone(defaultSettings), // snapshot of last saved state
  currentSessions:         [],
  otherSessions:           [],
  otherSessionsPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  sessions:                [],
  rolePreferences:         {},

  // ── Active section in settings nav ──────────────────────────────────────────
  activeSection: 'dashboard', // 'dashboard' | 'account' | 'security' | 'sessions' | 'notifications' | 'appearance' | 'privacy' | 'accessibility' | 'language' | 'role'

  // ── Unsaved changes ──────────────────────────────────────────────────────────
  isDirty:  false,

  // ── Loading states ───────────────────────────────────────────────────────────
  loading:          false, // initial page load
  saving:           false, // form save in progress
  changingPassword: false,
  loadingSessions:  false,
  revokingSession:  null,  // session id being revoked, or null

  // ── Email verification modal ─────────────────────────────────────────────────
  emailVerifyOpen:  false,
  pendingEmail:     null,  // new email awaiting verification
  verifyingEmail:   false,

  // ── Error ────────────────────────────────────────────────────────────────────
  error: null,
  sessionsError: null,

  // ── Fetch All ────────────────────────────────────────────────────────────────

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await settingsService.fetchSettings();
      set({
        settings:         clone(settings),
        pristineSettings: clone(settings),
        isDirty:          false,
        loading:          false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSessions: async (page = 1) => {
    set({ loadingSessions: true, sessionsError: null });
    try {
      const result = await settingsService.fetchSessions({ page, limit: 10 });
      if (result && typeof result === 'object' && Array.isArray(result.currentSessions)) {
        const currentSessions = result.currentSessions || [];
        const otherSessions = result.otherSessions || [];
        const pagination = result.pagination || { page, limit: 10, total: otherSessions.length, totalPages: 1 };
        set({
          currentSessions,
          otherSessions,
          otherSessionsPagination: pagination,
          sessions: [...currentSessions, ...otherSessions],
          loadingSessions: false,
          sessionsError: null,
        });
      } else if (Array.isArray(result)) {
        const currentSessions = result.filter((s) => s.isCurrent);
        const otherSessions = result.filter((s) => !s.isCurrent);
        set({
          currentSessions,
          otherSessions,
          otherSessionsPagination: { page: 1, limit: 10, total: otherSessions.length, totalPages: 1 },
          sessions: result,
          loadingSessions: false,
          sessionsError: null,
        });
      }
    } catch (err) {
      set({ sessionsError: err.message, loadingSessions: false });
      throw err;
    }
  },

  setOtherSessionsPage: async (page) => {
    return get().fetchSessions(page);
  },

  fetchRolePreferences: async (role) => {
    try {
      const rolePreferences = await settingsService.fetchRolePreferences(role);
      set({ rolePreferences });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Field Updates (local draft, sets dirty flag) ──────────────────────────

  /**
   * Update a single field within a settings category without saving.
   * @param {string} category - e.g., 'account', 'appearance', 'privacy'
   * @param {string} key      - field name within the category
   * @param {*}      value    - new value
   */
  updateField: (category, key, value) => {
    set((state) => ({
      settings: {
        ...state.settings,
        [category]: {
          ...state.settings[category],
          [key]: value,
        },
      },
      isDirty: true,
    }));
  },

  /**
   * Update multiple fields in a category at once.
   */
  updateFields: (category, updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        [category]: {
          ...state.settings[category],
          ...updates,
        },
      },
      isDirty: true,
    }));
  },

  /** Update role preferences draft */
  updateRolePreferenceField: (key, value) => {
    set((state) => ({
      rolePreferences: { ...state.rolePreferences, [key]: value },
      isDirty: true,
    }));
  },

  // ── Save / Discard ────────────────────────────────────────────────────────

  /**
   * Save the current draft of a specific settings category.
   * @param {string} category
   */
  saveCategory: async (category) => {
    set({ saving: true, error: null });
    try {
      const updates = get().settings[category];
      const saved = await settingsService.updateSettingsCategory(category, updates);
      set((state) => ({
        settings: {
          ...state.settings,
          [category]: clone(saved),
        },
        pristineSettings: {
          ...state.pristineSettings,
          [category]: clone(saved),
        },
        isDirty: false,
        saving:  false,
      }));
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  /** Discard local changes and revert to pristine state */
  discardChanges: () => {
    set((state) => ({
      settings: clone(state.pristineSettings),
      isDirty:  false,
    }));
  },

  /** Save role-specific preferences */
  saveRolePreferences: async (role) => {
    set({ saving: true, error: null });
    try {
      const data = get().rolePreferences;
      await settingsService.saveRolePreferences(role, data);
      set({ isDirty: false, saving: false });
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  // ── Account Actions ───────────────────────────────────────────────────────

  updateAccountSettings: async (data) => {
    set({ saving: true, error: null });
    try {
      const account = await settingsService.updateAccountSettings(data);
      set((state) => ({
        settings:         { ...state.settings, account },
        pristineSettings: { ...state.pristineSettings, account: clone(account) },
        isDirty:          false,
        saving:           false,
      }));
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  // Email change flow
  requestEmailChange: async (newEmail) => {
    set({ saving: true, error: null });
    try {
      await settingsService.requestEmailChange(newEmail);
      set({ pendingEmail: newEmail, emailVerifyOpen: true, saving: false });
    } catch (err) {
      set({ error: err.message, saving: false });
      throw err;
    }
  },

  verifyEmailChange: async (otp) => {
    const { pendingEmail } = get();
    set({ verifyingEmail: true, error: null });
    try {
      await settingsService.verifyEmailChange(otp, pendingEmail);
      set((state) => ({
        settings: {
          ...state.settings,
          account: { ...state.settings.account, email: pendingEmail },
        },
        pristineSettings: {
          ...state.pristineSettings,
          account: { ...state.pristineSettings.account, email: pendingEmail },
        },
        emailVerifyOpen: false,
        pendingEmail:    null,
        verifyingEmail:  false,
      }));
    } catch (err) {
      set({ error: err.message, verifyingEmail: false });
      throw err;
    }
  },

  // ── Security Actions ──────────────────────────────────────────────────────

  changePassword: async (data) => {
    set({ changingPassword: true, error: null });
    try {
      await settingsService.changePassword(data);
      const now = new Date().toISOString();
      set((state) => ({
        settings: {
          ...state.settings,
          security: { ...state.settings.security, lastPasswordChange: now },
        },
        pristineSettings: {
          ...state.pristineSettings,
          security: { ...state.pristineSettings.security, lastPasswordChange: now },
        },
        changingPassword: false,
      }));
    } catch (err) {
      set({ error: err.message, changingPassword: false });
      throw err;
    }
  },

  toggleTwoFactor: async (enabled) => {
    set({ saving: true });
    try {
      await settingsService.toggleTwoFactor(enabled);
      set((state) => ({
        settings: {
          ...state.settings,
          security: { ...state.settings.security, twoFactorEnabled: enabled },
        },
        saving: false,
      }));
    } catch (err) {
      set({ error: err.message, saving: false });
    }
  },

  // ── Session Actions ───────────────────────────────────────────────────────

  revokeSession: async (sessionId) => {
    set({ revokingSession: sessionId, sessionsError: null });
    try {
      await settingsService.revokeSession(sessionId);
      await get().fetchSessions(get().otherSessionsPagination.page || 1);
      set({ revokingSession: null });
    } catch (err) {
      set({ sessionsError: err.message, revokingSession: null });
      throw err;
    }
  },

  revokeOtherSessions: async () => {
    set({ revokingSession: 'all', sessionsError: null });
    try {
      await settingsService.revokeOtherSessions();
      await get().fetchSessions(1);
      set({ revokingSession: null });
    } catch (err) {
      set({ sessionsError: err.message, revokingSession: null });
      throw err;
    }
  },

  // ── UI Actions ────────────────────────────────────────────────────────────
  setActiveSection:   (section) => set({ activeSection: section }),
  setEmailVerifyOpen: (open)    => set({ emailVerifyOpen: open, ...(open ? {} : { pendingEmail: null }) }),
  clearError:         ()        => set({ error: null, sessionsError: null }),
}));

// ── Convenience Selectors ─────────────────────────────────────────────────────
export const useSettingsSection  = () => useSettingsStore((s) => s.activeSection);
export const useSettingsDirty    = () => useSettingsStore((s) => s.isDirty);
export const useSettingsSaving   = () => useSettingsStore((s) => s.saving);
export const useSettingsLoading  = () => useSettingsStore((s) => s.loading);
export const useAccountSettings  = () => useSettingsStore((s) => s.settings.account);
export const useAppearanceSettings = () => useSettingsStore((s) => s.settings.appearance);
export const usePrivacySettings  = () => useSettingsStore((s) => s.settings.privacy);
export const useNotifSettings    = () => useSettingsStore((s) => s.settings.notifications);
export const useAccessSettings   = () => useSettingsStore((s) => s.settings.accessibility);
export const useLanguageSettings = () => useSettingsStore((s) => s.settings.language);
export const useSecuritySettings = () => useSettingsStore((s) => s.settings.security);
export const useSessions         = () => useSettingsStore((s) => s.sessions);
export const useCurrentSessions  = () => useSettingsStore((s) => s.currentSessions);
export const useOtherSessions    = () => useSettingsStore((s) => s.otherSessions);
export const useOtherSessionsPagination = () => useSettingsStore((s) => s.otherSessionsPagination);
