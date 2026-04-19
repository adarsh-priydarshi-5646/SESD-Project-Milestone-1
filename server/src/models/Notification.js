const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    ...baseEntityFields,
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('TASK_ASSIGNED', 'STATUS_CHANGED', 'COMMENT_ADDED', 'DEADLINE_APPROACHING', 'MENTION'),
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedEntityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    relatedEntityType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    ...baseEntityOptions,
    tableName: 'notifications'
  });

  // Instance methods
  Notification.prototype.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
  };

  return Notification;
};
