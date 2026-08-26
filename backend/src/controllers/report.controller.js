const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ReportService = require('../services/report.service');

const getInternReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getInternPerformanceReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Intern performance report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getTaskReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getTaskPerformanceReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Task performance report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getAttendanceReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getAttendanceReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Attendance report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getLeaveReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getLeaveReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Leave report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getDepartmentReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getDepartmentPerformanceReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Department performance report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getInternshipProgressReport = asyncHandler(async (req, res) => {
  const result = await ReportService.getInternshipProgressReport(req.user, req.query);
  return sendSuccess(res, {
    message: 'Internship progress report retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

module.exports = {
  getInternReport,
  getTaskReport,
  getAttendanceReport,
  getLeaveReport,
  getDepartmentReport,
  getInternshipProgressReport,
};
