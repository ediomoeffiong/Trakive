const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const LeaveService = require('../services/leave.service');

const submitLeave = asyncHandler(async (req, res) => {
  const result = await LeaveService.submitLeave(req.user, req.body, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Leave request submitted successfully',
    data: result,
  });
});

const getMyLeaveRequests = asyncHandler(async (req, res) => {
  const result = await LeaveService.getMyLeaveRequests(req.user, req.query);
  return sendSuccess(res, {
    message: 'Personal leave requests retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getLeaveRequests = asyncHandler(async (req, res) => {
  const result = await LeaveService.getLeaveRequests(req.user, req.query);
  return sendSuccess(res, {
    message: 'Leave requests retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const getLeaveById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await LeaveService.getLeaveById(req.user, id);
  return sendSuccess(res, {
    message: 'Leave request details retrieved successfully',
    data: result,
  });
});

const approveLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await LeaveService.approveLeave(req.user, id, req.body, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Leave request approved successfully',
    data: result,
  });
});

const rejectLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await LeaveService.rejectLeave(req.user, id, req.body, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: 'Leave request rejected successfully',
    data: result,
  });
});

module.exports = {
  submitLeave,
  getMyLeaveRequests,
  getLeaveRequests,
  getLeaveById,
  approveLeave,
  rejectLeave,
};
