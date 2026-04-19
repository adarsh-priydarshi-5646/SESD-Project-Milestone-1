const TaskRepository = require('../repositories/TaskRepository');
const ProjectRepository = require('../repositories/ProjectRepository');
const { sequelize } = require('../models');

class DashboardService {
  async getUserDashboard(userId) {
    // Get task statistics
    const taskStats = await this.getTaskStatistics(userId);
    
    // Get project statistics
    const projectStats = await this.getProjectStatistics(userId);
    
    // Get recent tasks
    const recentTasks = await TaskRepository.findByAssignee(userId, { limit: 5 });
    
    // Get overdue tasks
    const overdueTasks = await this.getOverdueTasks(userId);
    
    return {
      taskStats,
      projectStats,
      recentTasks,
      overdueTasks
    };
  }

  async getTaskStatistics(userId) {
    const [results] = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks
      WHERE "assigneeId" = :userId
      GROUP BY status
    `, {
      replacements: { userId }
    });

    const stats = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      total: 0
    };

    results.forEach(row => {
      stats[row.status] = parseInt(row.count);
      stats.total += parseInt(row.count);
    });

    return stats;
  }

  async getProjectStatistics(userId) {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.status = 'ACTIVE' THEN p.id END) as active_projects
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm."projectId"
      WHERE p."managerId" = :userId OR pm."userId" = :userId
    `, {
      replacements: { userId }
    });

    return results[0] || { total_projects: 0, active_projects: 0 };
  }

  async getOverdueTasks(userId) {
    const [results] = await sequelize.query(`
      SELECT *
      FROM tasks
      WHERE "assigneeId" = :userId
        AND "dueDate" < CURRENT_DATE
        AND status != 'DONE'
      ORDER BY "dueDate" ASC
      LIMIT 10
    `, {
      replacements: { userId }
    });

    return results;
  }

  async getTeamDashboard(managerId) {
    // Get team member statistics
    const [teamStats] = await sequelize.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t."dueDate" < CURRENT_DATE AND t.status != 'DONE' THEN 1 END) as overdue_tasks
      FROM users u
      LEFT JOIN tasks t ON u.id = t."assigneeId"
      LEFT JOIN projects p ON t."projectId" = p.id
      WHERE p."managerId" = :managerId
      GROUP BY u.id, u.name, u.email
      ORDER BY total_tasks DESC
    `, {
      replacements: { managerId }
    });

    // Get project progress
    const projects = await ProjectRepository.findByManager(managerId);
    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const analytics = await ProjectRepository.getAnalytics(project.id);
        return {
          id: project.id,
          name: project.name,
          ...analytics
        };
      })
    );

    return {
      teamStats,
      projectProgress
    };
  }
}

module.exports = new DashboardService();
