const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const SettingsService = require('../services/settings.service');

const extractClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) return cfIp.trim();
  const realIp = req.headers['x-real-ip'];
  if (realIp) return realIp.trim();
  return req.ip || req.connection?.remoteAddress || null;
};

const getRefreshToken = (req) => req.body?.refreshToken || req.headers['x-refresh-token'] || null;

const SettingsController = {
  getSettings: asyncHandler(async (req, res) => {
    const result = await SettingsService.getSettings(req.user.id);
    return sendSuccess(res, {
      message: 'Settings retrieved successfully',
      data: result,
    });
  }),

  updateAccount: asyncHandler(async (req, res) => {
    const result = await SettingsService.updateAccount(req.user.id, req.body);
    return sendSuccess(res, {
      message: 'Account settings updated successfully',
      data: result,
    });
  }),

  updateCategory: asyncHandler(async (req, res) => {
    const result = await SettingsService.updateCategory(req.user.id, req.params.category, req.body);
    return sendSuccess(res, {
      message: 'Settings updated successfully',
      data: result,
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await SettingsService.changePassword(req.user.id, currentPassword, newPassword, getRefreshToken(req), {
      ipAddress: extractClientIp(req), userAgent: req.get('User-Agent'),
    });
    return sendSuccess(res, {
      message: result.message || 'Password changed successfully',
      data: { lastPasswordChange: result.lastPasswordChange },
    });
  }),

  beginTwoFactorSetup: asyncHandler(async (req, res) => {
    const result = await SettingsService.beginTwoFactorSetup(req.user.id);
    return sendSuccess(res, { message: 'Two-factor setup started', data: result });
  }),

  confirmTwoFactorSetup: asyncHandler(async (req, res) => {
    const result = await SettingsService.confirmTwoFactorSetup(req.user.id, req.body.code, {
      ipAddress: extractClientIp(req), userAgent: req.get('User-Agent'),
    });
    return sendSuccess(res, { message: 'Two-factor authentication enabled', data: result });
  }),

  disableTwoFactor: asyncHandler(async (req, res) => {
    const result = await SettingsService.disableTwoFactor(req.user.id, req.body.code, {
      ipAddress: extractClientIp(req), userAgent: req.get('User-Agent'),
    });
    return sendSuccess(res, { message: 'Two-factor authentication disabled', data: result });
  }),

  getSecurityEvents: asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await SettingsService.getSecurityEvents(req.user.id, { page, limit });
    return sendSuccess(res, { message: 'Security events retrieved', data: result });
  }),

  getRolePreferences: asyncHandler(async (req, res) => {
    const result = await SettingsService.getRolePreferences(req.user.id);
    return sendSuccess(res, {
      message: 'Role preferences retrieved successfully',
      data: result,
    });
  }),

  updateRolePreferences: asyncHandler(async (req, res) => {
    const result = await SettingsService.updateRolePreferences(req.user.id, req.body);
    return sendSuccess(res, {
      message: 'Role preferences updated successfully',
      data: result,
    });
  }),

  getSessions: asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await SettingsService.getSessions(req.user.id, req.headers['x-refresh-token'], {
      ipAddress: extractClientIp(req),
      userAgent: req.get('User-Agent'),
      currentSessionId: req.sessionId,
      page,
      limit,
    });
    return sendSuccess(res, {
      message: 'Sessions retrieved successfully',
      data: result,
    });
  }),

  revokeSession: asyncHandler(async (req, res) => {
    const result = await SettingsService.revokeSession(req.user.id, req.params.sessionId, {
      ipAddress: extractClientIp(req), userAgent: req.get('User-Agent'),
    });
    return sendSuccess(res, {
      message: 'Session revoked successfully',
      data: result,
    });
  }),

  revokeOtherSessions: asyncHandler(async (req, res) => {
    const result = await SettingsService.revokeOtherSessions(req.user.id, getRefreshToken(req), {
      ipAddress: extractClientIp(req), userAgent: req.get('User-Agent'),
    });
    return sendSuccess(res, {
      message: 'Other sessions revoked successfully',
      data: result,
    });
  }),
};

module.exports = SettingsController;
