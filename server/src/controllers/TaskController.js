const TaskService = require('../services/TaskService');
const logger = require('../utils/logger');

class TaskController {
  async createTask(req, res, next) {
    try {
      const taskData = req.body;
      const user = req.user;
      
      const task = await TaskService.createTask(taskData, user);

      logger.info(`Task created: ${task.id} by user: ${user.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.user;
      
      const task = await TaskService.updateTask(id, updateData, user);
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user;
      
      const task = await TaskService.updateTaskStatus(id, status, user);
      
      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTask(req, res, next) {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;
      const user = req.user;
      
      const task = await TaskService.assignTask(id, assigneeId, user);
      
      res.status(200).json({
        success: true,
        message: 'Task assigned successfully',
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const result = await TaskService.deleteTask(id, user);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      
      const task = await TaskService.getTaskById(id);
      
      res.status(200).json({
        success: true,
        data: { task }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        search: req.query.search,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };
      
      const tasks = await TaskService.getAllTasks(filters);
      
      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        projectId: req.query.projectId,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };
      
      const tasks = await TaskService.getTasksByAssignee(userId, filters);
      
      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectTasks(req, res, next) {
    try {
      const { projectId } = req.params;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assigneeId: req.query.assigneeId,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };
      
      const tasks = await TaskService.getTasksByProject(projectId, filters);
      
      res.status(200).json({
        success: true,
        data: { tasks }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
