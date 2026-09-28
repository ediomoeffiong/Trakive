const crypto = require('crypto');
const ApiError = require('../utils/apiError');
const SettingsModel = require('../models/settings.model');
const UserService = require('./user.service');
const AuthService = require('./auth.service');
const AuditLogModel = require('../models/auditLog.model');
const QRCode = require('qrcode');
const { createSetup, encryptSecret, verifyCode } = require('../utils/twoFactor.utils');

const SESSION_INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSION_HISTORY_PAGES = 10;

const normalizeIpAddress = (ipAddress = '') => {
  const value = String(ipAddress || '').trim();
  if (!value) return 'Unknown IP';
  if (value === '::1' || value === '127.0.0.1' || value === '::ffff:127.0.0.1') {
    return 'Localhost';
  }
  return value.replace(/^::ffff:/, '');
};

const titleCaseDevice = (userAgent = '') => {
  const agent = String(userAgent || '');
  const browser = /edg/i.test(agent) ? 'Microsoft Edge'
    : /opr|opera/i.test(agent) ? 'Opera'
      : /chrome|crios/i.test(agent) ? 'Chrome'
      : /firefox/i.test(agent) ? 'Firefox'
        : /safari/i.test(agent) ? 'Safari'
          : 'Browser';
  const os = /windows/i.test(agent) ? 'Windows'
    : /mac os|macintosh/i.test(agent) ? 'macOS'
      : /android/i.test(agent) ? 'Android'
        : /ipad/i.test(agent) ? 'iPadOS'
        : /iphone/i.test(agent) ? 'iOS'
          : /linux/i.test(agent) ? 'Linux'
            : 'Unknown OS';
  const deviceType = /ipad|tablet/i.test(agent) ? 'tablet' : /mobile|iphone|android/i.test(agent) ? 'mobile' : 'desktop';
  return { browser, os, deviceType, device: `${browser} on ${os}` };
};

const mapSettings = (profileResult, settingsRow) => {
  const user = profileResult.user || {};
  const roleProfile = profileResult.role_profile || {};
  return {
    account: {
      displayName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
      username: user.email ? user.email.split('@')[0] : '',
      email: user.email || '',
      phone: user.phone || '',
      emailVerified: Boolean(user.is_email_verified),
    },
    security: {
      twoFactorEnabled: Boolean(settingsRow.two_factor_enabled),
      twoFactorEnabledAt: settingsRow.two_factor_enabled_at || null,
      lastPasswordChange: settingsRow.last_password_change_at || null,
    },
    notifications: settingsRow.notifications || {},
    appearance: settingsRow.appearance || {},
    privacy: settingsRow.privacy || {},
    accessibility: settingsRow.accessibility || {},
    language: settingsRow.language || {},
    rolePreferences: settingsRow.role_preferences || {},
    roleProfile,
  };
};

const SettingsService = {
  async getSettings(userId) {
    const [profileResult, settingsRow] = await Promise.all([
      UserService.getProfile(userId),
      SettingsModel.ensureForUser(userId),
    ]);
    return mapSettings(profileResult, settingsRow);
  },

  async updateAccount(userId, data) {
    const [firstName = '', ...lastParts] = String(data.displayName || '').trim().split(/\s+/).filter(Boolean);
    const payload = {
      first_name: firstName || undefined,
      last_name: lastParts.join(' ') || undefined,
      phone: data.phone,
    };
    const updated = await UserService.updateProfile(userId, payload);
    const settingsRow = await SettingsModel.ensureForUser(userId);
    return mapSettings(updated, settingsRow).account;
  },

  async updateCategory(userId, category, updates) {
    if (category === 'account') {
      return this.updateAccount(userId, updates);
    }
    if (category === 'security') {
      throw ApiError.badRequest('Use the verified two-factor enrollment endpoints to change security settings');
    }
    const row = await SettingsModel.updateCategory(userId, category, updates);
    return category === 'role' ? row.role_preferences : row[category];
  },

  async changePassword(userId, currentPassword, newPassword, currentRefreshToken, requestMeta = {}) {
    const result = await AuthService.changePassword(userId, currentPassword, newPassword, currentRefreshToken);
    const settingsRow = await SettingsModel.setPasswordChanged(userId);
    const profile = await UserService.getProfile(userId);
    await AuditLogModel.log({
      organizationId: profile.user?.organization_id, userId, action: 'PASSWORD_CHANGED',
      entityType: 'users', entityId: userId, details: { otherSessionsRevoked: true },
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return { ...result, lastPasswordChange: settingsRow.last_password_change_at };
  },

  async beginTwoFactorSetup(userId) {
    const profile = await UserService.getProfile(userId);
    const current = await SettingsModel.ensureForUser(userId);
    if (current.two_factor_enabled) throw ApiError.conflict('Two-factor authentication is already enabled');
    const email = profile.user?.email;
    const setup = createSetup(email);
    await SettingsModel.setPendingTwoFactorSecret(userId, encryptSecret(setup.secret));
    return {
      secret: setup.secret,
      qrCodeDataUrl: await QRCode.toDataURL(setup.uri, { margin: 1, width: 240 }),
    };
  },

  async confirmTwoFactorSetup(userId, code, requestMeta = {}) {
    const row = await SettingsModel.ensureForUser(userId);
    if (!row.two_factor_pending_secret) throw ApiError.badRequest('Start two-factor setup before verifying a code');
    if (!(await verifyCode(row.two_factor_pending_secret, code))) {
      throw ApiError.badRequest('The authentication code is invalid or expired');
    }
    const enabled = await SettingsModel.enableTwoFactor(userId);
    const profile = await UserService.getProfile(userId);
    await AuditLogModel.log({
      organizationId: profile.user?.organization_id,
      userId,
      action: 'TWO_FACTOR_ENABLED',
      entityType: 'users',
      entityId: userId,
      details: { method: 'totp' },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
    return { twoFactorEnabled: true, twoFactorEnabledAt: enabled.two_factor_enabled_at };
  },

  async disableTwoFactor(userId, code, requestMeta = {}) {
    const row = await SettingsModel.ensureForUser(userId);
    if (!row.two_factor_enabled || !row.two_factor_secret) return { twoFactorEnabled: false };
    if (!(await verifyCode(row.two_factor_secret, code))) {
      throw ApiError.badRequest('The authentication code is invalid or expired');
    }
    await SettingsModel.disableTwoFactor(userId);
    const profile = await UserService.getProfile(userId);
    await AuditLogModel.log({
      organizationId: profile.user?.organization_id,
      userId,
      action: 'TWO_FACTOR_DISABLED',
      entityType: 'users',
      entityId: userId,
      details: { method: 'totp' },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
    return { twoFactorEnabled: false, twoFactorEnabledAt: null };
  },

  async getSecurityEvents(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const { events, total } = await AuditLogModel.findSecurityEvents(userId, { limit, offset });
    return {
      events: events.map((event) => ({
        id: event.id,
        type: event.action,
        timestamp: event.created_at,
        ip: event.ip_address || 'Unknown IP',
        userAgent: event.user_agent || '',
        details: event.details || {},
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getRolePreferences(userId) {
    const row = await SettingsModel.ensureForUser(userId);
    return row.role_preferences || {};
  },

  async updateRolePreferences(userId, preferences) {
    const row = await SettingsModel.updateCategory(userId, 'role', preferences);
    return row.role_preferences || {};
  },

  async getSessions(userId, currentRefreshToken, requestMeta = {}) {
    const requestedPage = Math.max(1, parseInt(requestMeta.page, 10) || 1);
    const page = Math.min(MAX_SESSION_HISTORY_PAGES, requestedPage);
    const limit = Math.min(50, Math.max(1, parseInt(requestMeta.limit, 10) || 10));
    const maxHistoryRecords = limit * MAX_SESSION_HISTORY_PAGES;
    const offset = (page - 1) * limit;

    const currentHash = currentRefreshToken
      ? crypto.createHash('sha256').update(currentRefreshToken).digest('hex')
      : null;
    if (currentHash) {
      await SettingsModel.touchSessionByHash(
        userId,
        currentHash,
        requestMeta.ipAddress,
        requestMeta.userAgent,
      );
    }

    const [activeRows, otherRows, totalOther] = await Promise.all([
      SettingsModel.listActiveSessions(userId),
      SettingsModel.listOtherSessions(userId, { limit, offset, maxRecords: maxHistoryRecords }),
      SettingsModel.countOtherSessions(userId, maxHistoryRecords),
    ]);

    const formatSession = (session, isCurrent = false) => {
      const device = titleCaseDevice(session.user_agent);
      const isRevoked = Boolean(session.is_revoked);
      const isExpired = new Date(session.expires_at) <= new Date();
      const lastSeenAt = session.last_seen_at || session.created_at;
      const isInactive = new Date(lastSeenAt).getTime() <= Date.now() - SESSION_INACTIVITY_MS;
      const status = isRevoked ? 'revoked' : (isExpired || isInactive) ? 'expired' : 'active';

      return {
        id: session.id,
        ...device,
        location: normalizeIpAddress(session.ip_address) === 'Localhost' ? 'Local development' : 'IP-based session',
        ip: normalizeIpAddress(session.ip_address),
        lastActive: session.last_seen_at || session.created_at,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        revokedAt: session.revoked_at || null,
        status,
        isCurrent,
      };
    };

    const currentSessions = activeRows.map((session) => {
      const isMatch = (currentHash && session.token_hash === currentHash)
        || (requestMeta.currentSessionId && session.family_id === requestMeta.currentSessionId);
      return formatSession(session, isMatch);
    });

    const otherSessions = otherRows.map((session) => formatSession(session, false));
    const totalPages = Math.ceil(totalOther / limit) || 1;

    return {
      currentSessions,
      otherSessions,
      pagination: {
        page,
        limit,
        total: totalOther,
        totalPages,
      },
    };
  },

  async revokeSession(userId, sessionId, requestMeta = {}) {
    const revoked = await SettingsModel.revokeSession(userId, sessionId);
    if (!revoked) throw ApiError.notFound('Session not found');
    const profile = await UserService.getProfile(userId);
    await AuditLogModel.log({
      organizationId: profile.user?.organization_id, userId, action: 'SESSION_REVOKED',
      entityType: 'refresh_tokens', entityId: sessionId, details: {},
      ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
    });
    return revoked;
  },

  async revokeOtherSessions(userId, currentRefreshToken, requestMeta = {}) {
    const currentHash = currentRefreshToken
      ? crypto.createHash('sha256').update(currentRefreshToken).digest('hex')
      : null;
    const revokedCount = await SettingsModel.revokeOtherSessions(userId, currentHash);
    if (revokedCount > 0) {
      const profile = await UserService.getProfile(userId);
      await AuditLogModel.log({
        organizationId: profile.user?.organization_id, userId, action: 'SESSION_REVOKED',
        entityType: 'refresh_tokens', entityId: null, details: { revokedCount },
        ipAddress: requestMeta.ipAddress, userAgent: requestMeta.userAgent,
      });
    }
    return { revokedCount };
  },
};

module.exports = SettingsService;
