const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AutomationService = require('../services/automation.service');

const AutomationController = {
  runAutomations: asyncHandler(async (req, res) => {
    const results = await AutomationService.runAllAutomations();
    return sendSuccess(res, {
      message: 'Automated background tasks executed successfully',
      data: results,
    });
  }),
};

module.exports = AutomationController;
