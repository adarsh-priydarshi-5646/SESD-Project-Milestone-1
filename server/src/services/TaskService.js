const TaskRepository = require('../repositories/TaskRepository');
const NotificationService = require('./NotificationService');
const PermissionService = require('./PermissionService');
const { ValidationError, ForbiddenError } = require('../utils/errors');

class TaskService {
  async createTask(taskData, user) {
    // Validate permission
    if (!PermissionService.checkPermission(user, 'CREATE_TASK')) {
      throw new ForbiddenError('You do not have permission to create tasks');
    }

    // Validate task data
    this.validateTaskData(taskData);

    // Add creator
    taskData.createdBy = user.id;

    // Create task
    const task = await TaskRepository.save(taskData);

    // Log activity
    await TaskRepository.logActivity(task.id, 'TASK_CREATED', user.id, {
      taskId: task.id,
      title: task.title
    });

    // Send notification if task is assigned
    if (task.assigneeId) {
      await NotificationService.notifyTaskAssignment(task);
    }

    return task;
  }

  async updateTaskStatus(taskId, newStatus, user) {
    const task = await TaskRepository.findById(taskId);
    
    if (!task) {
      throw new ValidationError('Task not found');
    }

    // Check permission
    if (!PermissionService.canUpdateTask(user, task)) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    const oldStatus = task.status;
    
    // Validate and change status
    task.changeStatus(newStatus);
    await task.save();

    // Log activity
    await TaskRepository.logActivity(taskId, 'STATUS_CHANGED', user.id, {
      from: oldStatus,
      to: newStatus
    });

    // Notify relevant users
    await NotificationService.notifyStatusChange(task, user);

    return task;
  }

  async assignTask(taskId, assigneeId, user) {
    const task = await TaskRepository.findById(taskId);
    
    if (!task) {
      throw new ValidationError('Task not found');
    }

    // Check permission
    if (!PermissionService.hasRole(user, 'MANAGER')) {
      throw new ForbiddenError('Only managers can assign tasks');
    }

    const oldAssignee = task.assigneeId;
    task.assigneeId = assigneeId;
    await task.save();

    // Log activity
    await TaskRepository.logActivity(taskId, 'TASK_ASSIGNED', user.id, {
      from: oldAssignee,
      to: assigneeId
    });

    // Notify new assignee
    await NotificationService.notifyTaskAssignment(task);

    return task;
  }

  async updateTask(taskId, updateData, user) {
    const task = await TaskRepository.findById(taskId);
    
    if (!task) {
      throw new ValidationError('Task not found');
    }

    if (!PermissionService.canUpdateTask(user, task)) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    this.validateTaskData(updateData, true);

    const updatedTask = await TaskRepository.update(taskId, updateData);

    await TaskRepository.logActivity(taskId, 'TASK_UPDATED', user.id, updateData);

    return updatedTask;
  }

  async deleteTask(taskId, user) {
    const task = await TaskRepository.findById(taskId);
    
    if (!task) {
      throw new ValidationError('Task not found');
    }

    if (!PermissionService.canDeleteTask(user, task)) {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    await TaskRepository.logActivity(taskId, 'TASK_DELETED', user.id, {
      taskId: task.id,
      title: task.title
    });

    await TaskRepository.delete(taskId);

    return { message: 'Task deleted successfully' };
  }

  async getTaskById(taskId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new ValidationError('Task not found');
    }
    return task;
  }

  async getTasksByProject(projectId, filters = {}) {
    return await TaskRepository.findByProject(projectId, filters);
  }

  async getTasksByAssignee(userId, filters = {}) {
    return await TaskRepository.findByAssignee(userId, filters);
  }

  async getAllTasks(filters = {}) {
    return await TaskRepository.findAll(filters);
  }

  validateTaskData(taskData, isUpdate = false) {
    if (!isUpdate) {
      if (!taskData.title) {
        throw new ValidationError('Task title is required');
      }
      if (!taskData.projectId) {
        throw new ValidationError('Project ID is required');
      }
    }

    if (taskData.title && taskData.title.length > 200) {
      throw new ValidationError('Task title must be less than 200 characters');
    }

    if (taskData.status && !['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(taskData.status)) {
      throw new ValidationError('Invalid task status');
    }

    if (taskData.priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(taskData.priority)) {
      throw new ValidationError('Invalid task priority');
    }
  }
}

module.exports = new TaskService();
