const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { changePasswordSchema } = require('../../utils/auth.validator');
const SettingsController = require('../../controllers/settings.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.put('/account', SettingsController.updateAccount);
router.put('/category/:category', SettingsController.updateCategory);
const codeSchema = { body: Joi.object({ code: Joi.string().pattern(/^\d{6}$/).required() }) };
const pagingSchema = { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(50).default(10) }) };
const sessionParamsSchema = { params: Joi.object({ sessionId: Joi.string().uuid().required() }) };

router.post('/change-password', validate(changePasswordSchema), SettingsController.changePassword);
router.post('/two-factor/setup', SettingsController.beginTwoFactorSetup);
router.post('/two-factor/confirm', validate(codeSchema), SettingsController.confirmTwoFactorSetup);
router.post('/two-factor/disable', validate(codeSchema), SettingsController.disableTwoFactor);
router.get('/security-events', validate(pagingSchema), SettingsController.getSecurityEvents);
router.get('/role-preferences', SettingsController.getRolePreferences);
router.put('/role-preferences', SettingsController.updateRolePreferences);
router.get('/sessions', validate(pagingSchema), SettingsController.getSessions);
router.delete('/sessions/others', SettingsController.revokeOtherSessions);
router.delete('/sessions/:sessionId', validate(sessionParamsSchema), SettingsController.revokeSession);

module.exports = router;
