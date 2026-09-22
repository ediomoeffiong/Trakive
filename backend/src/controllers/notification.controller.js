const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const NotificationModel = require('../models/notification.model');

const notFound = () => ApiError.notFound('Notification not found');

const NotificationController = {
  getNotifications: asyncHandler(async (req, res) => {
    const notifications = await NotificationModel.findByUserId(req.user.id);
    return sendSuccess(res, {
      message: 'Notifications retrieved successfully',
      data: notifications,
    });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const notification = await NotificationModel.markRead(req.params.id, req.user.id, true);
    if (!notification) throw notFound();
    return sendSuccess(res, {
      message: 'Notification marked as read',
      data: notification,
    });
  }),

  markAsUnread: asyncHandler(async (req, res) => {
    const notification = await NotificationModel.markRead(req.params.id, req.user.id, false);
    if (!notification) throw notFound();
    return sendSuccess(res, {
      message: 'Notification marked as unread',
      data: notification,
    });
  }),

  markAllAsRead: asyncHandler(async (req, res) => {
    const notifications = await NotificationModel.markAllRead(req.user.id);
    return sendSuccess(res, {
      message: 'All notifications marked as read',
      data: notifications,
    });
  }),

  archiveNotification: asyncHandler(async (req, res) => {
    const notification = await NotificationModel.archive(req.params.id, req.user.id);
    if (!notification) throw notFound();
    return sendSuccess(res, {
      message: 'Notification archived',
      data: notification,
    });
  }),

  deleteNotification: asyncHandler(async (req, res) => {
    const deleted = await NotificationModel.delete(req.params.id, req.user.id);
    if (!deleted) throw notFound();
    return sendSuccess(res, {
      message: 'Notification deleted',
      data: deleted,
    });
  }),
};

module.exports = NotificationController;
