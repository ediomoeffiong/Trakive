const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const NotificationService = require('../services/notification.service');

const NotificationController = {
  listNotifications: asyncHandler(async (req, res) => {
    const result = await NotificationService.listUserNotifications(req.user, req.query);
    return sendSuccess(res, {
      message: 'Notifications fetched successfully',
      data: result.items,
      meta: result.pagination,
    });
  }),

  getUnreadCount: asyncHandler(async (req, res) => {
    const data = await NotificationService.getUnreadCount(req.user);
    return sendSuccess(res, {
      message: 'Unread notification count fetched successfully',
      data,
    });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const notification = await NotificationService.markAsRead(req.params.id, req.user);
    return sendSuccess(res, {
      message: 'Notification marked as read',
      data: notification,
    });
  }),

  markAllAsRead: asyncHandler(async (req, res) => {
    const result = await NotificationService.markAllAsRead(req.user);
    return sendSuccess(res, {
      message: result.message,
      data: result,
    });
  }),

  deleteNotification: asyncHandler(async (req, res) => {
    const result = await NotificationService.deleteNotification(req.params.id, req.user);
    return sendSuccess(res, {
      message: result.message,
    });
  }),
};

module.exports = NotificationController;
