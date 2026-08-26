const express = require('express');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const AutomationController = require('../../controllers/automation.controller');

const router = express.Router();

router.post('/run', authenticate, requireRole('admin', 'hr'), AutomationController.runAutomations);

module.exports = router;
