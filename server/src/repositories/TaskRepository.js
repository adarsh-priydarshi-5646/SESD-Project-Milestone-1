const { Task, User, Project, ActivityLog } = require('../models');
const { Op } = require('sequelize');

class TaskRepository {
  async save(taskData) {
    return await Task.create(taskData);
  }

  async findById(taskId) {
    return await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });
  }

  async findByAssignee(userId, filters = {}) {
    const where = { assigneeId: userId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    return await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async findByProject(projectId, filters = {}) {
    const where = { projectId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    return await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    return await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async update(taskId, updateData) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;
    
    return await task.update(updateData);
  }

  async delete(taskId) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;
    
    await task.destroy();
    return true;
  }

  async logActivity(taskId, action, userId, changes = {}) {
    return await ActivityLog.create({
      entityId: taskId,
      entityType: 'TASK',
      userId,
      action,
      changes
    });
  }

  async count(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    return await Task.count({ where });
  }
}

module.exports = new TaskRepository();
