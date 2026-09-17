const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AttendanceService = require('../services/attendance.service');

const getToday = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getToday(req.user);
  return sendSuccess(res, { message: 'Today attendance state retrieved successfully', data });
});

const checkIn = asyncHandler(async (req, res) => {
  const data = await AttendanceService.checkIn(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Attendance check-in recorded successfully', data });
});

const requestCorrection = asyncHandler(async (req, res) => {
  const data = await AttendanceService.requestCorrection(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Attendance correction request submitted successfully', data });
});

const getHistory = asyncHandler(async (req, res) => {
  const data = await AttendanceService.listInternHistory(req.user, req.query);
  return sendSuccess(res, { message: 'Attendance history retrieved successfully', data });
});

const getSupervisorDashboard = asyncHandler(async (req, res) => {
  const data = await AttendanceService.listSupervisorDashboard(req.user, req.query);
  return sendSuccess(res, { message: 'Supervisor attendance dashboard retrieved successfully', data });
});

const getConfiguration = asyncHandler(async (req, res) => {
  const data = await AttendanceService.listConfiguration(req.user);
  return sendSuccess(res, { message: 'Attendance configuration retrieved successfully', data });
});

const upsertOffice = asyncHandler(async (req, res) => {
  const data = await AttendanceService.upsertOffice(req.user, req.body);
  return sendSuccess(res, { message: 'Attendance office saved successfully', data });
});

const upsertPolicy = asyncHandler(async (req, res) => {
  const data = await AttendanceService.upsertPolicy(req.user, req.body);
  return sendSuccess(res, { message: 'Attendance policy saved successfully', data });
});

const createOverride = asyncHandler(async (req, res) => {
  const data = await AttendanceService.createOverride(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Attendance override created successfully', data });
});

const addHoliday = asyncHandler(async (req, res) => {
  const data = await AttendanceService.addHoliday(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Attendance holiday saved successfully', data });
});

const manualAttendance = asyncHandler(async (req, res) => {
  const data = await AttendanceService.manualAttendance(req.user, req.body);
  return sendSuccess(res, { message: 'Manual attendance change saved successfully', data });
});

const reviewCorrection = asyncHandler(async (req, res) => {
  const data = await AttendanceService.reviewCorrection(req.user, req.params.id, req.body);
  return sendSuccess(res, { message: 'Attendance correction reviewed successfully', data });
});

const exportReport = asyncHandler(async (req, res) => {
  const format = req.query.format === 'pdf' ? 'pdf' : 'csv';
  const result = await AttendanceService.exportReport(req.user, req.query, format);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  return res.status(200).send(result.body);
});

module.exports = {
  getToday,
  checkIn,
  requestCorrection,
  getHistory,
  getSupervisorDashboard,
  getConfiguration,
  upsertOffice,
  upsertPolicy,
  createOverride,
  addHoliday,
  manualAttendance,
  reviewCorrection,
  exportReport,
};
