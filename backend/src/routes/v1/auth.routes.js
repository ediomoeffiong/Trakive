const express = require('express');
const validate = require('../../middleware/validate.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/security.middleware');
const {
  registerSchema,
  loginSchema,
  activateExistingSchema,
  twoFactorLoginSchema,
  emailOtpLoginSchema,
  resendEmailOtpLoginSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require('../../utils/auth.validator');
const AuthController = require('../../controllers/auth.controller');

const router = express.Router();

// Public Authentication Routes
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/activate-existing', authLimiter, validate(activateExistingSchema), AuthController.activateExisting);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/login/two-factor', authLimiter, validate(twoFactorLoginSchema), AuthController.verifyTwoFactorLogin);
router.post('/login/email-otp', authLimiter, validate(emailOtpLoginSchema), AuthController.verifyEmailOtpLogin);
router.post('/login/email-otp/resend', authLimiter, validate(resendEmailOtpLoginSchema), AuthController.resendEmailOtpLogin);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', validate(verifyEmailSchema), AuthController.verifyEmail);

// Protected Authentication Routes
router.get('/me', authenticate, AuthController.getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

module.exports = router;
