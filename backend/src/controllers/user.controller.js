const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const UserService = require('../services/user.service');

const getProfile = asyncHandler(async (req, res) => {
  const result = await UserService.getProfile(req.user.id);
  return sendSuccess(res, {
    message: 'User profile retrieved successfully',
    data: result,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await UserService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, {
    message: 'User profile updated successfully',
    data: result,
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar_url } = req.body;
  const result = await UserService.updateAvatar(req.user.id, avatar_url);
  return sendSuccess(res, {
    message: 'Avatar reference updated successfully',
    data: result,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id, req.user);
  return sendSuccess(res, {
    message: 'User details retrieved successfully',
    data: result,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await UserService.listUsers(req.query, req.user);
  return sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: result.items,
    meta: result.pagination,
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserService.updateUserStatus(id, status, req.user, req.ip, req.headers['user-agent']);
  return sendSuccess(res, {
    message: `User status updated to ${status} successfully`,
    data: result,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  getUserById,
  listUsers,
  updateUserStatus,
};
