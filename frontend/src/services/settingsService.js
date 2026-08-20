/**
 * @file settingsService.js
 * @description Mock service layer for Trakive's Settings & Preferences module.
 *
 * All functions return Promises with artificial delays to simulate backend responses.
 * Replace each function body with a real API call when integrating with the backend.
 */

import { defaultSettings } from '../data/settings';
import { mockSessions }    from '../data/sessions';
import { ROLE_PREFERENCES_MAP } from '../data/preferences';

/** Artificial API delay helper */
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ── In-memory state (simulates persisted backend data) ────────────────────────
let _settings    = JSON.parse(JSON.stringify(defaultSettings)); // deep clone
let _sessions    = [...mockSessions];
let _rolePrefs   = {};  // populated per-role on first access

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the full user settings object.
 * @returns {Promise<object>}
 */
export const fetchSettings = async () => {
  await delay(800);
  return JSON.parse(JSON.stringify(_settings));
};

/**
 * Fetch active sessions for the current user.
 * @returns {Promise<Array>}
 */
export const fetchSessions = async () => {
  await delay(700);
  return [..._sessions];
};

/**
 * Fetch role-specific preferences.
 * @param {string} role - e.g., 'Intern' | 'Supervisor' | 'HR Administrator' | 'Department Head'
 * @returns {Promise<object>}
 */
export const fetchRolePreferences = async (role) => {
  await delay(500);
  if (!_rolePrefs[role]) {
    _rolePrefs[role] = JSON.parse(JSON.stringify(ROLE_PREFERENCES_MAP[role] ?? {}));
  }
  return { ..._rolePrefs[role] };
};

// ── Account ───────────────────────────────────────────────────────────────────

/**
 * Update account settings (display name, username, phone).
 * @param {object} data
 * @returns {Promise<object>} Updated account object
 */
export const updateAccountSettings = async (data) => {
  await delay(900);
  _settings.account = { ..._settings.account, ...data };
  return { ..._settings.account };
};

/**
 * Request email change — initiates mock verification flow.
 * @param {string} newEmail
 * @returns {Promise<{ message: string }>}
 */
export const requestEmailChange = async (newEmail) => {
  await delay(800);
  // In real implementation this would send a verification email
  return { message: `Verification email sent to ${newEmail}. Please enter the code to confirm.` };
};

/**
 * Verify OTP code for email change.
 * @param {string} otp
 * @param {string} newEmail
 * @returns {Promise<{ success: boolean }>}
 */
export const verifyEmailChange = async (otp, newEmail) => {
  await delay(700);
  // Mock: any 6-digit code works
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Invalid verification code. Please try again.');
  }
  _settings.account.email = newEmail;
  _settings.account.emailVerified = true;
  return { success: true };
};

// ── Security ──────────────────────────────────────────────────────────────────

/**
 * Change the current user's password.
 * @param {{ currentPassword: string, newPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  await delay(1000);
  // Mock: any non-empty current password is accepted
  if (!currentPassword || currentPassword.length < 6) {
    throw new Error('Current password is incorrect. Please try again.');
  }
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }
  _settings.security.lastPasswordChange = new Date().toISOString();
  return { message: 'Password changed successfully.' };
};

/**
 * Toggle two-factor authentication.
 * @param {boolean} enabled
 * @returns {Promise<object>}
 */
export const toggleTwoFactor = async (enabled) => {
  await delay(700);
  _settings.security.twoFactorEnabled = enabled;
  return { ..._settings.security };
};

// ── Sessions ──────────────────────────────────────────────────────────────────

/**
 * Revoke a specific session by ID.
 * @param {string} sessionId
 * @returns {Promise<{ id: string }>}
 */
export const revokeSession = async (sessionId) => {
  await delay(600);
  _sessions = _sessions.filter((s) => s.id !== sessionId);
  return { id: sessionId };
};

/**
 * Revoke all sessions except the current one.
 * @returns {Promise<{ revokedCount: number }>}
 */
export const revokeOtherSessions = async () => {
  await delay(800);
  const prev = _sessions.length;
  _sessions = _sessions.filter((s) => s.isCurrent);
  return { revokedCount: prev - _sessions.length };
};

// ── Preferences (Notification / Privacy / Accessibility) ──────────────────────

/**
 * Update any category of settings (notifications, appearance, privacy, accessibility, language).
 * @param {string} category - The settings category key
 * @param {object} updates  - Partial update object
 * @returns {Promise<object>} Updated category object
 */
export const updateSettingsCategory = async (category, updates) => {
  await delay(700);
  _settings[category] = { ..._settings[category], ...updates };
  return { ..._settings[category] };
};

// ── Role-specific Preferences ─────────────────────────────────────────────────

/**
 * Save role-specific preference overrides.
 * @param {string} role
 * @param {object} data
 * @returns {Promise<object>}
 */
export const saveRolePreferences = async (role, data) => {
  await delay(700);
  _rolePrefs[role] = { ...(_rolePrefs[role] ?? {}), ...data };
  return { ..._rolePrefs[role] };
};

// ── Named export bundle ───────────────────────────────────────────────────────
export const settingsService = {
  fetchSettings,
  fetchSessions,
  fetchRolePreferences,
  updateAccountSettings,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  toggleTwoFactor,
  revokeSession,
  revokeOtherSessions,
  updateSettingsCategory,
  saveRolePreferences,
};
