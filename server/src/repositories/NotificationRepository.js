const { Notification } = require('../models');

class NotificationRepository {
  async save(notificationData) {
    return await Notification.create(notificationData);
  }

  async bulkCreate(notifications) {
    return await Notification.bulkCreate(notifications);
  }

  async findById(notificationId) {
    return await Notification.findByPk(notificationId);
  }

  async findByUser(userId, filters = {}) {
    const where = { userId };
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });
    
    if (!notification) return null;
    
    notification.markAsRead();
    await notification.save();
    
    return notification;
  }

  async markAllAsRead(userId) {
    return await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
  }

  async delete(notificationId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) return null;
    
    await notification.destroy();
    return true;
  }

  async count(userId, filters = {}) {
    const where = { userId };
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    return await Notification.count({ where });
  }
}

module.exports = new NotificationRepository();
