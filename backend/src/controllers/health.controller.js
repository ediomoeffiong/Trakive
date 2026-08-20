const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const healthService = require('../services/health.service');

/**
 * Controller for health check endpoint
 */
const getHealth = asyncHandler(async (req, res) => {
  const healthData = await healthService.checkHealth();
  const statusCode = healthData.status === 'ok' ? 200 : 503;

  return sendSuccess(res, {
    statusCode,
    message: healthData.status === 'ok' ? 'API and database are healthy' : 'API running with degraded database status',
    data: healthData,
  });
});

module.exports = {
  getHealth,
};
