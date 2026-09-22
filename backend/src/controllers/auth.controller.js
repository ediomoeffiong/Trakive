const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AuthService = require('../services/auth.service');

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

const AuthController = {
  register: asyncHandler(async (req, res) => {
    const ipAddress = extractClientIp(req);
    const userAgent = req.get('User-Agent');

    const result = await AuthService.register(req.body, ipAddress, userAgent);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: result,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = extractClientIp(req);
    const userAgent = req.get('User-Agent');

    const result = await AuthService.login(email, password, ipAddress, userAgent);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result,
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const ipAddress = extractClientIp(req);
    const userAgent = req.get('User-Agent');

    const result = await AuthService.refresh(refreshToken, ipAddress, userAgent);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Access token refreshed successfully',
      data: result,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    const result = await AuthService.logout(refreshToken);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
    });
  }),

  getMe: asyncHandler(async (req, res) => {
    const result = await AuthService.getMe(req.user.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Authenticated user profile retrieved',
      data: { user: result },
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
    });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.resetToken ? { resetToken: result.resetToken } : null,
    });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await AuthService.resetPassword(token, newPassword);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
    });
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.body;
    const result = await AuthService.verifyEmail(token);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
    });
  }),
};

module.exports = AuthController;
