const NotificationRepository = require('../repositories/NotificationRepository');
const EmailService = require('./EmailService');
const logger = require('../utils/logger');

class NotificationService {
  async notifyTaskAssignment(task) {
    try {
      if (!task.assigneeId) return;

      const message = `You have been assigned to task: ${task.title}`;
      
      await NotificationRepository.save({
        userId: task.assigneeId,
        type: 'TASK_ASSIGNED',
        message,
        relatedEntityId: task.id,
        relatedEntityType: 'TASK'
      });

      // Send email notification
      await EmailService.sendTaskAssignmentEmail(task);
    } catch (error) {
      logger.error('Error sending task assignment notification:', error);
    }
  }

  async notifyStatusChange(task, changedBy) {
    try {
      const message = `Task "${task.title}" status changed to ${task.status}`;
      
      // Notify task creator if different from the person who changed it
      if (task.createdBy !== changedBy.id) {
        await NotificationRepository.save({
          userId: task.createdBy,
          type: 'STATUS_CHANGED',
          message,
          relatedEntityId: task.id,
          relatedEntityType: 'TASK'
        });
      }

      // Notify assignee if different from the person who changed it
      if (task.assigneeId && task.assigneeId !== changedBy.id) {
        await NotificationRepository.save({
          userId: task.assigneeId,
          type: 'STATUS_CHANGED',
          message,
          relatedEntityId: task.id,
          relatedEntityType: 'TASK'
        });
      }
    } catch (error) {
      logger.error('Error sending status change notification:', error);
    }
  }

  async notifyCommentAdded(comment, task) {
    try {
      const message = `New comment on task: ${task.title}`;
      
      // Notify task assignee
      if (task.assigneeId && task.assigneeId !== comment.userId) {
        await NotificationRepository.save({
          userId: task.assigneeId,
          type: 'COMMENT_ADDED',
          message,
          relatedEntityId: comment.id,
          relatedEntityType: 'COMMENT'
        });
      }

      // Notify mentioned users
      if (comment.mentions && comment.mentions.length > 0) {
        for (const mentionedUserId of comment.mentions) {
          if (mentionedUserId !== comment.userId) {
            await NotificationRepository.save({
              userId: mentionedUserId,
              type: 'MENTION',
              message: `You were mentioned in a comment on task: ${task.title}`,
              relatedEntityId: comment.id,
              relatedEntityType: 'COMMENT'
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error sending comment notification:', error);
    }
  }

  async notifyDeadlineApproaching(task) {
    try {
      if (!task.assigneeId) return;

      const message = `Task "${task.title}" deadline is approaching`;
      
      await NotificationRepository.save({
        userId: task.assigneeId,
        type: 'DEADLINE_APPROACHING',
        message,
        relatedEntityId: task.id,
        relatedEntityType: 'TASK'
      });
    } catch (error) {
      logger.error('Error sending deadline notification:', error);
    }
  }

  async sendBulkNotifications(userIds, message, type = 'TASK_ASSIGNED') {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type,
        message,
        relatedEntityId: null,
        relatedEntityType: null
      }));

      await NotificationRepository.bulkCreate(notifications);
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
    }
  }

  async getUserNotifications(userId, filters = {}) {
    return await NotificationRepository.findByUser(userId, filters);
  }

  async markAsRead(notificationId, userId) {
    return await NotificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return await NotificationRepository.markAllAsRead(userId);
  }
}

module.exports = new NotificationService();
