const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const SettingsService = require('../services/settings.service');

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
    const result = await SettingsService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, {
      message: result.message || 'Password changed successfully',
    });
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
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      page,
      limit,
    });
    return sendSuccess(res, {
      message: 'Sessions retrieved successfully',
      data: result,
    });
  }),

  revokeSession: asyncHandler(async (req, res) => {
    const result = await SettingsService.revokeSession(req.user.id, req.params.sessionId);
    return sendSuccess(res, {
      message: 'Session revoked successfully',
      data: result,
    });
  }),

  revokeOtherSessions: asyncHandler(async (req, res) => {
    const result = await SettingsService.revokeOtherSessions(req.user.id, getRefreshToken(req));
    return sendSuccess(res, {
      message: 'Other sessions revoked successfully',
      data: result,
    });
  }),
};

module.exports = SettingsController;
