const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
