const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ActivityService = require('../services/activity.service');

const getActivities = asyncHandler(async (req, res) => {
  const result = await ActivityService.getActivities(req.user, req.query);
  return sendSuccess(res, {
    message: 'System activities retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

module.exports = {
  getActivities,
};
