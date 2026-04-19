const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    ...baseEntityFields,
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    ...baseEntityOptions,
    tableName: 'attachments',
    updatedAt: false
  });

  return Attachment;
};
