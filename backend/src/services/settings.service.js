const crypto = require('crypto');
const ApiError = require('../utils/apiError');
const SettingsModel = require('../models/settings.model');
const UserService = require('./user.service');
const AuthService = require('./auth.service');

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
      ssoEnabled: false,
      lastPasswordChange: settingsRow.last_password_change_at || user.updated_at || user.created_at || null,
      connectedProviders: [],
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
      if (typeof updates.twoFactorEnabled === 'boolean') {
        const row = await SettingsModel.setTwoFactor(userId, updates.twoFactorEnabled);
        return {
          twoFactorEnabled: row.two_factor_enabled,
          ssoEnabled: false,
          lastPasswordChange: row.last_password_change_at,
          connectedProviders: [],
        };
      }
      throw ApiError.badRequest('Unsupported security setting update');
    }
    const row = await SettingsModel.updateCategory(userId, category, updates);
    return category === 'role' ? row.role_preferences : row[category];
  },

  async changePassword(userId, currentPassword, newPassword) {
    const result = await AuthService.changePassword(userId, currentPassword, newPassword);
    await SettingsModel.setPasswordChanged(userId);
    return result;
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
    const page = Math.max(1, parseInt(requestMeta.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(requestMeta.limit, 10) || 10));
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
      SettingsModel.listOtherSessions(userId, { limit, offset }),
      SettingsModel.countOtherSessions(userId),
    ]);

    const formatSession = (session, isCurrent = false) => {
      const device = titleCaseDevice(session.user_agent);
      const isRevoked = Boolean(session.is_revoked);
      const isExpired = new Date(session.expires_at) <= new Date();
      const status = isRevoked ? 'revoked' : isExpired ? 'expired' : 'active';

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

    let hasCurrent = false;
    const currentSessions = activeRows.map((session, index) => {
      const isMatch = currentHash ? session.token_hash === currentHash : index === 0;
      if (isMatch) hasCurrent = true;
      return formatSession(session, isMatch);
    });

    if (!hasCurrent && currentSessions.length > 0) {
      currentSessions[0].isCurrent = true;
    }

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

  async revokeSession(userId, sessionId) {
    const revoked = await SettingsModel.revokeSession(userId, sessionId);
    if (!revoked) throw ApiError.notFound('Session not found');
    return revoked;
  },

  async revokeOtherSessions(userId, currentRefreshToken) {
    const currentHash = currentRefreshToken
      ? crypto.createHash('sha256').update(currentRefreshToken).digest('hex')
      : null;
    const revokedCount = await SettingsModel.revokeOtherSessions(userId, currentHash);
    return { revokedCount };
  },
};

module.exports = SettingsService;
