const { Project, User, Task, ProjectMember, sequelize } = require('../models');
const { Op } = require('sequelize');

class ProjectRepository {
  async save(projectData) {
    return await Project.create(projectData);
  }

  async findById(projectId) {
    return await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'members', attributes: ['id', 'name', 'email'], through: { attributes: [] } }
      ]
    });
  }

  async findByManager(managerId) {
    return await Project.findAll({
      where: { managerId },
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findByUserAsManagerOrMember(userId) {
    return await Project.findAll({
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
          where: { id: userId },
          required: false
        }
      ],
      where: {
        [Op.or]: [
          { managerId: userId },
          { '$members.id$': userId }
        ]
      },
      subQuery: false,
      order: [['createdAt', 'DESC']]
    });
  }

  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    return await Project.findAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0
    });
  }

  async update(projectId, updateData) {
    const project = await Project.findByPk(projectId);
    if (!project) return null;
    
    return await project.update(updateData);
  }

  async delete(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) return null;
    
    await project.destroy();
    return true;
  }

  async addMember(projectId, userId) {
    return await ProjectMember.create({ projectId, userId });
  }

  async removeMember(projectId, userId) {
    return await ProjectMember.destroy({
      where: { projectId, userId }
    });
  }

  async getMembers(projectId) {
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });
    return project ? project.members : [];
  }

  async getAnalytics(projectId) {
    const taskStats = await Task.findAll({
      where: { projectId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const priorityStats = await Task.findAll({
      where: { projectId },
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    const totalTasks = await Task.count({ where: { projectId } });
    const completedTasks = await Task.count({ where: { projectId, status: 'DONE' } });

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
      tasksByStatus: taskStats,
      tasksByPriority: priorityStats
    };
  }

  async count(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }

    return await Project.count({ where });
  }
}

module.exports = new ProjectRepository();
