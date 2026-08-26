const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AttendanceService = require('../services/attendance.service');

const clockIn = asyncHandler(async (req, res) => {
  const result = await AttendanceService.clockIn(req.user, req.body, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Clock-in recorded successfully',
    data: result,
  });
});

const clockOut = asyncHandler(async (req, res) => {
  const result = await AttendanceService.clockOut(req.user, req.body, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Clock-out recorded successfully',
    data: result,
  });
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const result = await AttendanceService.getMyAttendance(req.user, req.query);
  return sendSuccess(res, {
    message: 'Personal attendance records retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getAttendance = asyncHandler(async (req, res) => {
  const result = await AttendanceService.getAttendance(req.user, req.query);
  return sendSuccess(res, {
    message: 'Attendance records retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

module.exports = {
  clockIn,
  clockOut,
  getMyAttendance,
  getAttendance,
};
