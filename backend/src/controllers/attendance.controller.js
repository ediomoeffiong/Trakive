const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AttendanceService = require('../services/attendance.service');
const SearchController = require('./search.controller');

const getToday = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getToday(req.user, req.query);
  return sendSuccess(res, { message: 'Today attendance retrieved', data });
});

const checkIn = asyncHandler(async (req, res) => {
  const data = await AttendanceService.checkIn(req.user, req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return sendSuccess(res, { statusCode: 201, message: 'Check-in recorded', data });
});

const requestCorrection = asyncHandler(async (req, res) => {
  const data = await AttendanceService.requestCorrection(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Review request submitted', data });
});

const getMeHistory = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getInternHistory(req.user, req.query);
  return sendSuccess(res, { message: 'Attendance history retrieved', data });
});

const getMeSummary = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getInternSummary(req.user, req.user.id, req.query.internship_record_id);
  return sendSuccess(res, { message: 'Attendance summary retrieved', data });
});

const supervisorDashboard = asyncHandler(async (req, res) => {
  const data = await AttendanceService.supervisorDashboard(req.user, req.query);
  return sendSuccess(res, { message: 'Attendance dashboard retrieved', data });
});

const listRecords = asyncHandler(async (req, res) => {
  return SearchController.searchAttendance(req, res);
});

const internHistory = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getInternHistory(req.user, { ...req.query, intern_id: req.params.internId });
  return sendSuccess(res, { message: 'Intern attendance history retrieved', data });
});

const internSummary = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getInternSummary(req.user, req.params.internId, req.query.internship_record_id);
  return sendSuccess(res, { message: 'Intern attendance summary retrieved', data });
});

const manualUpsert = asyncHandler(async (req, res) => {
  const data = await AttendanceService.manualUpsert(req.user, req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return sendSuccess(res, { message: 'Attendance saved', data });
});

const reviewCorrection = asyncHandler(async (req, res) => {
  const data = await AttendanceService.reviewCorrection(req.user, req.params.id, req.body, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  return sendSuccess(res, { message: 'Correction request reviewed', data });
});

const getConfig = asyncHandler(async (req, res) => {
  const data = await AttendanceService.getConfig(req.user);
  return sendSuccess(res, { message: 'Attendance configuration retrieved', data });
});

const updatePolicy = asyncHandler(async (req, res) => {
  const data = await AttendanceService.updatePolicy(req.user, req.body);
  return sendSuccess(res, { message: 'Attendance policy updated', data });
});

const updateDepartmentSchedule = asyncHandler(async (req, res) => {
  const data = await AttendanceService.updateDepartmentSchedule(req.user, req.params.departmentId, req.body.weekdays);
  return sendSuccess(res, { message: 'Department schedule updated', data });
});

const createOverride = asyncHandler(async (req, res) => {
  const data = await AttendanceService.createOverride(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Schedule override created', data });
});

const deleteOverride = asyncHandler(async (req, res) => {
  await AttendanceService.deleteOverride(req.user, req.params.id);
  return sendSuccess(res, { message: 'Schedule override removed' });
});

const listOffices = asyncHandler(async (req, res) => {
  const data = await AttendanceService.listOffices(req.user);
  return sendSuccess(res, { message: 'Offices retrieved', data });
});

const createOffice = asyncHandler(async (req, res) => {
  const data = await AttendanceService.saveOffice(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Office created', data });
});

const updateOffice = asyncHandler(async (req, res) => {
  const data = await AttendanceService.saveOffice(req.user, req.body, req.params.id);
  return sendSuccess(res, { message: 'Office updated', data });
});

const deleteOffice = asyncHandler(async (req, res) => {
  await AttendanceService.deleteOffice(req.user, req.params.id);
  return sendSuccess(res, { message: 'Office removed' });
});

const createHoliday = asyncHandler(async (req, res) => {
  const data = await AttendanceService.createOrgHoliday(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Holiday created', data });
});

const deleteHoliday = asyncHandler(async (req, res) => {
  await AttendanceService.deleteOrgHoliday(req.user, req.params.id);
  return sendSuccess(res, { message: 'Holiday removed' });
});

const updatePerformance = asyncHandler(async (req, res) => {
  const data = await AttendanceService.updatePerformanceSettings(req.user, req.body);
  return sendSuccess(res, { message: 'Attendance scoring settings updated', data });
});

const exportRecords = asyncHandler(async (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();
  const file = await AttendanceService.exportRecords(req.user, req.query, format);
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.status(200).send(file.body);
});

module.exports = {
  getToday,
  checkIn,
  requestCorrection,
  getMeHistory,
  getMeSummary,
  supervisorDashboard,
  listRecords,
  internHistory,
  internSummary,
  manualUpsert,
  reviewCorrection,
  getConfig,
  updatePolicy,
  updateDepartmentSchedule,
  createOverride,
  deleteOverride,
  listOffices,
  createOffice,
  updateOffice,
  deleteOffice,
  createHoliday,
  deleteHoliday,
  updatePerformance,
  exportRecords,
};
