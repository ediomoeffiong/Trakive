const ApiError = require('../utils/apiError');
const NotificationModel = require('../models/notification.model');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const NotificationService = {
  /**
   * Reusable method to create a notification for a user
   * @param {Object} params 
   * @param {string} params.userId
   * @param {string} params.title
   * @param {string} params.message
   * @param {string} [params.type='system']
   * @param {string} [params.linkUrl=null]
   */
  async createNotification({ userId, title, message, type = 'system', linkUrl = null }) {
    if (!userId || !title || !message) {
      throw ApiError.badRequest('Notification requires userId, title, and message');
    }
    return await NotificationModel.create({ userId, title, message, type, linkUrl });
  },

  /**
   * Get user notifications with pagination & filtering
   * @param {Object} requestingUser 
   * @param {Object} queryParams 
   */
  async listUserNotifications(requestingUser, queryParams = {}) {
    const { page, limit, offset } = getPaginationParams(queryParams);
    const userId = requestingUser.id;
    const type = queryParams.type || null;
    const isRead = queryParams.is_read;

    const items = await NotificationModel.findUserNotifications({
      userId,
      type,
      isRead,
      limit,
      offset,
    });

    const totalItems = await NotificationModel.countUserNotifications({
      userId,
      type,
      isRead,
    });

    return formatPaginatedResponse(items, totalItems, page, limit);
  },

  /**
   * Get count of unread notifications for requesting user
   * @param {Object} requestingUser 
   */
  async getUnreadCount(requestingUser) {
    const count = await NotificationModel.getUnreadCount(requestingUser.id);
    return { unread_count: count };
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId 
   * @param {Object} requestingUser 
   */
  async markAsRead(notificationId, requestingUser) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.user_id !== requestingUser.id) {
      throw ApiError.forbidden('Access denied: You cannot modify another user\'s notification');
    }

    const updated = await NotificationModel.markAsRead(notificationId, requestingUser.id);
    return updated;
  },

  /**
   * Mark all notifications for user as read
   * @param {Object} requestingUser 
   */
  async markAllAsRead(requestingUser) {
    const updated = await NotificationModel.markAllAsRead(requestingUser.id);
    return { message: 'All notifications marked as read', count: updated.length };
  },

  /**
   * Delete a notification
   * @param {string} notificationId 
   * @param {Object} requestingUser 
   */
  async deleteNotification(notificationId, requestingUser) {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.user_id !== requestingUser.id) {
      throw ApiError.forbidden('Access denied: You cannot delete another user\'s notification');
    }

    await NotificationModel.delete(notificationId, requestingUser.id);
    return { message: 'Notification deleted successfully' };
  },
};

module.exports = NotificationService;
