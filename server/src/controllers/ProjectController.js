const ProjectService = require('../services/ProjectService');
const logger = require('../utils/logger');

class ProjectController {
  async createProject(req, res, next) {
    try {
      const projectData = req.body;
      const user = req.user;
      
      const project = await ProjectService.createProject(projectData, user);

      logger.info(`Project created: ${project.id} by user: ${user.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;
      
      const project = await ProjectService.updateProject(id, updateData, user);
      
      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const result = await ProjectService.deleteProject(id, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      
      const project = await ProjectService.getProjectById(id);
      
      res.status(200).json({
        success: true,
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllProjects(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };
      
      const projects = await ProjectService.getAllProjects(filters);
      
      res.status(200).json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProjects(req, res, next) {
    try {
      const userId = req.user.id;
      
      const projects = await ProjectService.getProjectsByManager(userId);
      
      res.status(200).json({
        success: true,
        data: { projects }
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const user = req.user;
      
      const result = await ProjectService.addTeamMember(id, userId, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { id, userId } = req.params;
      const user = req.user;
      
      const result = await ProjectService.removeTeamMember(id, userId, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const analytics = await ProjectService.getProjectAnalytics(id, user);
      
      res.status(200).json({
        success: true,
        data: { analytics }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();
