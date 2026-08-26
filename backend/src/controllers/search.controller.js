const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const SearchService = require('../services/search.service');

const SearchController = {
  searchGlobal: asyncHandler(async (req, res) => {
    const result = await SearchService.searchGlobal(req.query, req.user);
    if (result.items) {
      return sendSuccess(res, {
        message: 'Search results retrieved successfully',
        data: result.items,
        meta: result.pagination,
      });
    }
    return sendSuccess(res, {
      message: 'Search results retrieved successfully',
      data: result,
    });
  }),

  searchUsers: asyncHandler(async (req, res) => {
    const result = await SearchService.searchUsers(req.query, req.user);
    return sendSuccess(res, {
      message: 'User search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchTasks: asyncHandler(async (req, res) => {
    const result = await SearchService.searchTasks(req.query, req.user);
    return sendSuccess(res, {
      message: 'Task search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchAttendance: asyncHandler(async (req, res) => {
    const result = await SearchService.searchAttendance(req.query, req.user);
    return sendSuccess(res, {
      message: 'Attendance search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchLeave: asyncHandler(async (req, res) => {
    const result = await SearchService.searchLeave(req.query, req.user);
    return sendSuccess(res, {
      message: 'Leave search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchNotifications: asyncHandler(async (req, res) => {
    const result = await SearchService.searchNotifications(req.query, req.user);
    return sendSuccess(res, {
      message: 'Notification search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchDocuments: asyncHandler(async (req, res) => {
    const result = await SearchService.searchDocuments(req.query, req.user);
    return sendSuccess(res, {
      message: 'Document search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  searchMessages: asyncHandler(async (req, res) => {
    const result = await SearchService.searchMessages(req.query, req.user);
    return sendSuccess(res, {
      message: 'Message search results retrieved successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),
};

module.exports = SearchController;
