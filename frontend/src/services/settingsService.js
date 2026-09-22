/**
 * @file settingsService.js
 * @description Settings service backed by the API, with local demo fallback.
 */

import api from './api';
import { defaultSettings } from '../data/settings';
import { mockCurrentSessions, mockOtherSessions, mockSessions } from '../data/sessions';
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
let _currentSessions = [...mockCurrentSessions];
let _otherSessions = [...mockOtherSessions];
let _sessions = [...mockSessions];
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
    appearance: { ...defaultSettings.appearance, ...persisted.appearance, ...serverSettings.appearance },
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
    } catch {
      // Fall through to durable local settings for offline/demo resilience.
    }
  }
  await delay();
  _settings = mergeSettings(readLocal('all', _settings));
  return clone(_settings);
};

export const fetchSessions = async ({ page = 1, limit = 10 } = {}) => {
  if (hasRealBackendToken()) {
    try {
      const result = dataOf(await api.get('/settings/sessions', {
        params: { page, limit },
        headers: { 'X-Refresh-Token': getRefreshToken() || '' },
      }));
      if (result && typeof result === 'object' && Array.isArray(result.currentSessions)) {
        return result;
      }
      if (Array.isArray(result)) {
        return {
          currentSessions: result.filter((s) => s.isCurrent),
          otherSessions: result.filter((s) => !s.isCurrent),
          pagination: { page: 1, limit: 10, total: result.filter((s) => !s.isCurrent).length, totalPages: 1 },
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to load active sessions');
    }
  }
  await delay();
  const storedCurrent = readLocal('current_sessions', _currentSessions);
  const storedOther = readLocal('other_sessions', _otherSessions);
  const total = storedOther.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginatedOther = storedOther.slice(start, start + limit);

  return {
    currentSessions: clone(storedCurrent),
    otherSessions: clone(paginatedOther),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
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
      await api.post('/settings/change-password', { currentPassword, newPassword });
      saveLocalCategory('security', { lastPasswordChange: new Date().toISOString() });
      return { message: 'Password changed successfully.' };
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
  saveLocalCategory('security', { lastPasswordChange: new Date().toISOString() });
  return { message: 'Password changed successfully.' };
};

export const toggleTwoFactor = async (enabled) => {
  if (hasRealBackendToken()) {
    try {
      const security = dataOf(await api.put('/settings/category/security', { twoFactorEnabled: enabled }));
      return saveLocalCategory('security', security);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Unable to update two-factor settings');
    }
  }
  await delay();
  return saveLocalCategory('security', { twoFactorEnabled: enabled });
};

export const revokeSession = async (sessionId) => {
  if (hasRealBackendToken()) {
    await api.delete(`/settings/sessions/${sessionId}`);
  } else {
    await delay();
  }
  const current = readLocal('current_sessions', _currentSessions);
  const other = readLocal('other_sessions', _otherSessions);
  const targetIndex = current.findIndex((s) => s.id === sessionId);
  if (targetIndex !== -1) {
    const [revoked] = current.splice(targetIndex, 1);
    const moved = {
      ...revoked,
      isCurrent: false,
      status: 'revoked',
      revokedAt: new Date().toISOString(),
    };
    other.unshift(moved);
    _currentSessions = [...current];
    _otherSessions = [...other];
    writeLocal('current_sessions', _currentSessions);
    writeLocal('other_sessions', _otherSessions);
  }
  _sessions = [..._currentSessions, ..._otherSessions];
  return { id: sessionId };
};

export const revokeOtherSessions = async () => {
  if (hasRealBackendToken()) {
    await api.delete('/settings/sessions/others', { data: { refreshToken: getRefreshToken() } });
  } else {
    await delay();
  }
  const current = readLocal('current_sessions', _currentSessions);
  const other = readLocal('other_sessions', _otherSessions);
  const activeCurrent = current.filter((s) => s.isCurrent);
  const toRevoke = current.filter((s) => !s.isCurrent);

  const revokedItems = toRevoke.map((s) => ({
    ...s,
    isCurrent: false,
    status: 'revoked',
    revokedAt: new Date().toISOString(),
  }));

  _currentSessions = activeCurrent.length > 0 ? activeCurrent : (current.slice(0, 1) || []);
  _otherSessions = [...revokedItems, ...other];
  writeLocal('current_sessions', _currentSessions);
  writeLocal('other_sessions', _otherSessions);
  _sessions = [..._currentSessions, ..._otherSessions];
  return { revokedCount: toRevoke.length };
};

export const updateSettingsCategory = async (category, updates) => {
  if (category === 'account') return updateAccountSettings(updates);
  if (category === 'security' && Object.prototype.hasOwnProperty.call(updates, 'twoFactorEnabled')) {
    return toggleTwoFactor(updates.twoFactorEnabled);
  }

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
  toggleTwoFactor,
  revokeSession,
  revokeOtherSessions,
  updateSettingsCategory,
  saveRolePreferences,
};
