const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    ...baseEntityFields,
    entityId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    ...baseEntityOptions,
    tableName: 'activity_logs',
    updatedAt: false
  });

  // Instance methods
  ActivityLog.prototype.getDescription = function() {
    return `${this.action} on ${this.entityType} ${this.entityId}`;
  };

  return ActivityLog;
};
