const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    ...baseEntityFields,
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mentions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    ...baseEntityOptions,
    tableName: 'comments'
  });

  // Instance methods
  Comment.prototype.extractMentions = function() {
    const mentionRegex = /@([a-f0-9-]{36})/g;
    const matches = this.content.match(mentionRegex);
    if (matches) {
      this.mentions = matches.map(m => m.substring(1));
    }
    return this.mentions;
  };

  return Comment;
};
