const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { AnalyticsService } = require('../services/analytics.service');

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const metrics = await AnalyticsService.getDashboardMetrics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Dashboard metrics retrieved successfully',
    data: metrics,
  });
});

const getTaskAnalytics = asyncHandler(async (req, res) => {
  const analytics = await AnalyticsService.getTaskAnalytics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Task analytics retrieved successfully',
    data: analytics,
  });
});

const getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const analytics = await AnalyticsService.getAttendanceAnalytics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Attendance analytics retrieved successfully',
    data: analytics,
  });
});

const getLeaveAnalytics = asyncHandler(async (req, res) => {
  const analytics = await AnalyticsService.getLeaveAnalytics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Leave analytics retrieved successfully',
    data: analytics,
  });
});

const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const analytics = await AnalyticsService.getPerformanceAnalytics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Performance analytics retrieved successfully',
    data: analytics,
  });
});

const getInternshipProgressAnalytics = asyncHandler(async (req, res) => {
  const analytics = await AnalyticsService.getInternshipProgressAnalytics(req.user, req.query);
  return sendSuccess(res, {
    message: 'Internship progress analytics retrieved successfully',
    data: analytics,
  });
});

module.exports = {
  getDashboardMetrics,
  getTaskAnalytics,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPerformanceAnalytics,
  getInternshipProgressAnalytics,
};
