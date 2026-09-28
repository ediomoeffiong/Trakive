/**
 * @file settingsService.js
 * @description Settings service backed by the API, with local demo fallback.
 */

import api from './api';
import { defaultSettings } from '../data/settings';
import { ROLE_PREFERENCES_MAP } from '../data/preferences';
import { useAppStore } from '../store/useAppStore';
import { getAccessToken, getRefreshToken } from '../utils/authSession';

const clone = (obj) => JSON.parse(JSON.stringify(obj));
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const dataOf = (response) => response?.data?.data ?? response?.data;

const UNSUPPORTED_NOTIFICATION_FIELDS = {
  emailNotifications: false,
  pushNotifications: false,
};

const normalizeNotificationSettings = (notifications = {}) => ({
  ...defaultSettings.notifications,
  ...(notifications || {}),
  ...UNSUPPORTED_NOTIFICATION_FIELDS,
});

let _settings = clone(defaultSettings);
let _rolePrefs = {};

const hasRealBackendToken = () => {
  const token = getAccessToken();
  return Boolean(token && !String(token).startsWith('mock-') && !String(token).startsWith('mock-jwt-token'));
};

const localKey = (suffix) => {
  const user = useAppStore.getState()?.user;
  return `trakive_settings_${user?.id || 'default'}_${suffix}`;
};

const readLocal = (suffix, fallback) => {
  try {
    const value = localStorage.getItem(localKey(suffix));
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (suffix, value) => {
  try {
    localStorage.setItem(localKey(suffix), JSON.stringify(value));
  } catch {
    // Browser storage can be unavailable in restricted contexts.
  }
};

const mergeSettings = (serverSettings = {}) => {
  const user = useAppStore.getState()?.user;
  const activeTheme = useAppStore.getState()?.theme;
  const account = {
    ...defaultSettings.account,
    displayName: user?.name || serverSettings.account?.displayName || defaultSettings.account.displayName,
    username: serverSettings.account?.username || user?.email?.split('@')[0] || defaultSettings.account.username,
    email: user?.email || serverSettings.account?.email || defaultSettings.account.email,
    phone: serverSettings.account?.phone || user?.phone || defaultSettings.account.phone,
    emailVerified: serverSettings.account?.emailVerified ?? user?.emailVerified ?? defaultSettings.account.emailVerified,
  };

  const persisted = readLocal('all', {});
  return {
    ...clone(defaultSettings),
    ...persisted,
    ...serverSettings,
    account: { ...defaultSettings.account, ...persisted.account, ...serverSettings.account, ...account },
    security: { ...defaultSettings.security, ...persisted.security, ...serverSettings.security },
    notifications: normalizeNotificationSettings({ ...persisted.notifications, ...serverSettings.notifications }),
    appearance: {
      ...defaultSettings.appearance,
      ...persisted.appearance,
      ...serverSettings.appearance,
      ...(activeTheme ? { theme: activeTheme } : {}),
    },
    privacy: { ...defaultSettings.privacy, ...persisted.privacy, ...serverSettings.privacy },
    accessibility: { ...defaultSettings.accessibility, ...persisted.accessibility, ...serverSettings.accessibility },
    language: { ...defaultSettings.language, ...persisted.language, ...serverSettings.language },
  };
};

const saveLocalCategory = (category, updates) => {
  _settings = {
    ..._settings,
    [category]: { ...(_settings[category] || {}), ...(updates || {}) },
  };
  writeLocal('all', _settings);
  return clone(_settings[category]);
};

export const fetchSettings = async () => {
  if (hasRealBackendToken()) {
    try {
      const settings = mergeSettings(dataOf(await api.get('/settings')));
      _settings = clone(settings);
      writeLocal('all', settings);
      return clone(settings);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to load settings');
    }
  }
  await delay();
  _settings = mergeSettings(readLocal('all', _settings));
  return clone(_settings);
};

export const fetchSessions = async ({ page = 1, limit = 10 } = {}) => {
  if (!hasRealBackendToken()) {
    throw new Error('Live session history is unavailable while using local mock authentication.');
  }

  try {
    const result = dataOf(await api.get('/settings/sessions', {
      params: { page, limit },
      headers: { 'X-Refresh-Token': getRefreshToken() || '' },
    }));

    if (!result || typeof result !== 'object' || !Array.isArray(result.currentSessions) || !Array.isArray(result.otherSessions)) {
      throw new Error('Invalid sessions response from server');
    }

    return result;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Unable to load active sessions');
  }
};

export const fetchRolePreferences = async (role) => {
  if (hasRealBackendToken()) {
    try {
      const preferences = dataOf(await api.get('/settings/role-preferences'));
      _rolePrefs[role] = { ...(ROLE_PREFERENCES_MAP[role] ?? {}), ...(preferences || {}) };
      return { ..._rolePrefs[role] };
    } catch {
      // Use fallback below.
    }
  }
  await delay();
  if (!_rolePrefs[role]) {
    _rolePrefs[role] = readLocal(`role_${role}`, clone(ROLE_PREFERENCES_MAP[role] ?? {}));
  }
  return { ..._rolePrefs[role] };
};

export const updateAccountSettings = async (data) => {
  if (hasRealBackendToken()) {
    try {
      const account = dataOf(await api.put('/settings/account', data));
      saveLocalCategory('account', account);
      useAppStore.getState()?.updateUserMeta?.({
        name: account.displayName,
        phone: account.phone,
      });
      return { ..._settings.account };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to update account settings');
    }
  }
  await delay();
  const account = saveLocalCategory('account', data);
  useAppStore.getState()?.updateUserMeta?.({
    name: account.displayName,
    phone: account.phone,
  });
  return account;
};

export const requestEmailChange = async (newEmail) => {
  await delay();
  return { message: `Verification email sent to ${newEmail}. Please enter the code to confirm.` };
};

export const verifyEmailChange = async (otp, newEmail) => {
  await delay();
  if (!/^\d{6}$/.test(otp)) {
    throw new Error('Invalid verification code. Please try again.');
  }
  const account = saveLocalCategory('account', { email: newEmail, emailVerified: true });
  return { success: true, account };
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  if (hasRealBackendToken()) {
    try {
      const result = dataOf(await api.post('/settings/change-password', { currentPassword, newPassword }, {
        headers: { 'X-Refresh-Token': getRefreshToken() || '' },
      }));
      saveLocalCategory('security', { lastPasswordChange: result.lastPasswordChange });
      return { message: 'Password changed successfully.', ...result };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to change password');
    }
  }
  await delay();
  if (!currentPassword || currentPassword.length < 6) {
    throw new Error('Current password is incorrect. Please try again.');
  }
  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters.');
  }
  const lastPasswordChange = new Date().toISOString();
  saveLocalCategory('security', { lastPasswordChange });
  return { message: 'Password changed successfully.', lastPasswordChange };
};

export const beginTwoFactorSetup = async () => {
  if (!hasRealBackendToken()) throw new Error('Two-factor authentication requires a live account.');
  return dataOf(await api.post('/settings/two-factor/setup'));
};

export const confirmTwoFactorSetup = async (code) => {
  if (!hasRealBackendToken()) throw new Error('Two-factor authentication requires a live account.');
  const security = dataOf(await api.post('/settings/two-factor/confirm', { code }));
  return saveLocalCategory('security', security);
};

export const disableTwoFactor = async (code) => {
  if (!hasRealBackendToken()) throw new Error('Two-factor authentication requires a live account.');
  const security = dataOf(await api.post('/settings/two-factor/disable', { code }));
  return saveLocalCategory('security', security);
};

export const fetchSecurityEvents = async ({ page = 1, limit = 10 } = {}) => {
  if (!hasRealBackendToken()) throw new Error('Security history requires a live account.');
  return dataOf(await api.get('/settings/security-events', { params: { page, limit } }));
};

export const revokeSession = async (sessionId) => {
  if (!hasRealBackendToken()) {
    throw new Error('Live session controls are unavailable while using local mock authentication.');
  }

  await api.delete(`/settings/sessions/${sessionId}`);
  return { id: sessionId };
};

export const revokeOtherSessions = async () => {
  if (!hasRealBackendToken()) {
    throw new Error('Live session controls are unavailable while using local mock authentication.');
  }

  const result = dataOf(await api.delete('/settings/sessions/others', {
    data: { refreshToken: getRefreshToken() },
  }));
  return result;
};

export const updateSettingsCategory = async (category, updates) => {
  if (category === 'account') return updateAccountSettings(updates);
  if (category === 'security') throw new Error('Security settings require their verified security flow.');

  const normalizedUpdates = category === 'notifications'
    ? normalizeNotificationSettings(updates)
    : updates;

  if (hasRealBackendToken()) {
    try {
      const updated = dataOf(await api.put(`/settings/category/${category}`, normalizedUpdates));
      return saveLocalCategory(category, category === 'notifications' ? normalizeNotificationSettings(updated) : updated);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || `Unable to update ${category} settings`);
    }
  }
  await delay();
  return saveLocalCategory(category, normalizedUpdates);
};

export const saveRolePreferences = async (role, data) => {
  if (hasRealBackendToken()) {
    try {
      const preferences = dataOf(await api.put('/settings/role-preferences', data));
      _rolePrefs[role] = preferences || data;
      writeLocal(`role_${role}`, _rolePrefs[role]);
      return { ..._rolePrefs[role] };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to save role preferences');
    }
  }
  await delay();
  _rolePrefs[role] = { ...(_rolePrefs[role] ?? {}), ...data };
  writeLocal(`role_${role}`, _rolePrefs[role]);
  return { ..._rolePrefs[role] };
};

export const settingsService = {
  fetchSettings,
  fetchSessions,
  fetchRolePreferences,
  updateAccountSettings,
  requestEmailChange,
  verifyEmailChange,
  changePassword,
  beginTwoFactorSetup,
  confirmTwoFactorSetup,
  disableTwoFactor,
  fetchSecurityEvents,
  revokeSession,
  revokeOtherSessions,
  updateSettingsCategory,
  saveRolePreferences,
};
