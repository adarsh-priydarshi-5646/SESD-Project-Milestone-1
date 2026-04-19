const { DataTypes } = require('sequelize');
const { baseEntityFields, baseEntityOptions } = require('./BaseEntity');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    ...baseEntityFields,
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'PLANNING'
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    ...baseEntityOptions,
    tableName: 'projects'
  });

  // Instance methods
  Project.prototype.isMember = async function(userId) {
    const ProjectMember = sequelize.models.ProjectMember;
    const membership = await ProjectMember.findOne({
      where: { projectId: this.id, userId }
    });
    return !!membership || this.managerId === userId;
  };

  return Project;
};
