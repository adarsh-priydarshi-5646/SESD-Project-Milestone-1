const { DataTypes } = require('sequelize');
const { baseEntityFields } = require('./BaseEntity');

module.exports = (sequelize) => {
  const ProjectMember = sequelize.define('ProjectMember', {
    ...baseEntityFields,
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
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
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'project_members',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['projectId', 'userId']
      }
    ]
  });

  return ProjectMember;
};
