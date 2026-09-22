const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const SettingsController = require('../../controllers/settings.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.put('/account', SettingsController.updateAccount);
router.put('/category/:category', SettingsController.updateCategory);
router.post('/change-password', SettingsController.changePassword);
router.get('/role-preferences', SettingsController.getRolePreferences);
router.put('/role-preferences', SettingsController.updateRolePreferences);
router.get('/sessions', SettingsController.getSessions);
router.delete('/sessions/others', SettingsController.revokeOtherSessions);
router.delete('/sessions/:sessionId', SettingsController.revokeSession);

module.exports = router;
