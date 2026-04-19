const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    ...baseEntityFields,
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'),
      allowNull: false,
      defaultValue: 'TODO'
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
      allowNull: false,
      defaultValue: 'MEDIUM'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    dependsOn: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      }
    }
  }, {
    ...baseEntityOptions,
    tableName: 'tasks'
  });

  // Instance methods
  Task.prototype.canBeUpdatedBy = function(userId, userRole) {
    return this.assigneeId === userId || 
           this.createdBy === userId || 
           userRole === 'MANAGER' || 
           userRole === 'ADMIN';
  };

  Task.prototype.isOverdue = function() {
    if (!this.dueDate) return false;
    return new Date(this.dueDate) < new Date() && this.status !== 'DONE';
  };

  Task.prototype.changeStatus = function(newStatus) {
    const validTransitions = {
      'TODO': ['IN_PROGRESS'],
      'IN_PROGRESS': ['IN_REVIEW', 'TODO'],
      'IN_REVIEW': ['DONE', 'IN_PROGRESS'],
      'DONE': ['IN_REVIEW']
    };
    
    const allowedStatuses = validTransitions[this.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }
    
    this.status = newStatus;
  };

  return Task;
};
