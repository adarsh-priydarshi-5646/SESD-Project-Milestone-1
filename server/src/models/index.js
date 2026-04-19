const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

// Import models
const User = require('./User')(sequelize);
const Project = require('./Project')(sequelize);
const Task = require('./Task')(sequelize);
const Comment = require('./Comment')(sequelize);
const Attachment = require('./Attachment')(sequelize);
const Notification = require('./Notification')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);
const ProjectMember = require('./ProjectMember')(sequelize);

// Define associations
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activities' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', as: 'projects' });

Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', as: 'members' });

Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' });
Task.hasMany(ActivityLog, { foreignKey: 'entityId', as: 'activities' });
Task.belongsTo(Task, { foreignKey: 'dependsOn', as: 'dependency' });

Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Attachment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  Comment,
  Attachment,
  Notification,
  ActivityLog,
  ProjectMember
};
