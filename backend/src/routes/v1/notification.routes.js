const express = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const NotificationController = require('../../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', NotificationController.listNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
