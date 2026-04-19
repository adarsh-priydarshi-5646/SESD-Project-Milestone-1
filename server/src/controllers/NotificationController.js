const NotificationService = require('../services/NotificationService');
const logger = require('../utils/logger');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
        type: req.query.type,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };
      
      const notifications = await NotificationService.getUserNotifications(userId, filters);
      
      res.status(200).json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const NotificationRepository = require('../repositories/NotificationRepository');
      
      const count = await NotificationRepository.count(userId, { isRead: false });
      
      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const notification = await NotificationService.markAsRead(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      
      await NotificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const NotificationRepository = require('../repositories/NotificationRepository');
      
      await NotificationRepository.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
