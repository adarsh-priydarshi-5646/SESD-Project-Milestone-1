const TaskService = require('../../../src/services/TaskService');
const TaskRepository = require('../../../src/repositories/TaskRepository');
const NotificationService = require('../../../src/services/NotificationService');
const PermissionService = require('../../../src/services/PermissionService');
const { ValidationError, ForbiddenError } = require('../../../src/utils/errors');

jest.mock('../../../src/repositories/TaskRepository');
jest.mock('../../../src/services/NotificationService');
jest.mock('../../../src/services/PermissionService');

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        projectId: 'project-123',
        assigneeId: 'user-456'
      };
      const user = { id: 'user-123', role: 'MANAGER' };
      const mockTask = { id: 'task-123', ...taskData, createdBy: user.id };

      PermissionService.checkPermission.mockReturnValue(true);
      TaskRepository.save.mockResolvedValue(mockTask);
      TaskRepository.logActivity.mockResolvedValue({});
      NotificationService.notifyTaskAssignment.mockResolvedValue({});

      const result = await TaskService.createTask(taskData, user);

      expect(result).toEqual(mockTask);
      expect(PermissionService.checkPermission).toHaveBeenCalledWith(user, 'CREATE_TASK');
      expect(TaskRepository.save).toHaveBeenCalled();
      expect(TaskRepository.logActivity).toHaveBeenCalled();
      expect(NotificationService.notifyTaskAssignment).toHaveBeenCalledWith(mockTask);
    });

    it('should throw error if user lacks permission', async () => {
      const taskData = { title: 'Test Task', projectId: 'project-123' };
      const user = { id: 'user-123', role: 'TEAM_MEMBER' };

      PermissionService.checkPermission.mockReturnValue(false);

      await expect(TaskService.createTask(taskData, user)).rejects.toThrow(ForbiddenError);
    });

    it('should throw error if title is missing', async () => {
      const taskData = { projectId: 'project-123' };
      const user = { id: 'user-123', role: 'MANAGER' };

      PermissionService.checkPermission.mockReturnValue(true);

      await expect(TaskService.createTask(taskData, user)).rejects.toThrow(ValidationError);
    });

    it('should throw error if projectId is missing', async () => {
      const taskData = { title: 'Test Task' };
      const user = { id: 'user-123', role: 'MANAGER' };

      PermissionService.checkPermission.mockReturnValue(true);

      await expect(TaskService.createTask(taskData, user)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const taskId = 'task-123';
      const newStatus = 'IN_PROGRESS';
      const user = { id: 'user-123', role: 'TEAM_MEMBER' };
      
      const mockTask = {
        id: taskId,
        status: 'TODO',
        assigneeId: user.id,
        changeStatus: jest.fn(),
        save: jest.fn()
      };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.canUpdateTask.mockReturnValue(true);
      TaskRepository.logActivity.mockResolvedValue({});
      NotificationService.notifyStatusChange.mockResolvedValue({});

      await TaskService.updateTaskStatus(taskId, newStatus, user);

      expect(mockTask.changeStatus).toHaveBeenCalledWith(newStatus);
      expect(mockTask.save).toHaveBeenCalled();
      expect(TaskRepository.logActivity).toHaveBeenCalled();
      expect(NotificationService.notifyStatusChange).toHaveBeenCalled();
    });

    it('should throw error if task not found', async () => {
      TaskRepository.findById.mockResolvedValue(null);

      await expect(
        TaskService.updateTaskStatus('nonexistent', 'IN_PROGRESS', { id: 'user-123' })
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if user lacks permission', async () => {
      const mockTask = {
        id: 'task-123',
        status: 'TODO',
        assigneeId: 'other-user'
      };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.canUpdateTask.mockReturnValue(false);

      await expect(
        TaskService.updateTaskStatus('task-123', 'IN_PROGRESS', { id: 'user-123' })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('assignTask', () => {
    it('should assign task successfully', async () => {
      const taskId = 'task-123';
      const assigneeId = 'user-456';
      const user = { id: 'user-123', role: 'MANAGER' };
      
      const mockTask = {
        id: taskId,
        assigneeId: null,
        save: jest.fn()
      };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.hasRole.mockReturnValue(true);
      TaskRepository.logActivity.mockResolvedValue({});
      NotificationService.notifyTaskAssignment.mockResolvedValue({});

      const result = await TaskService.assignTask(taskId, assigneeId, user);

      expect(mockTask.assigneeId).toBe(assigneeId);
      expect(mockTask.save).toHaveBeenCalled();
      expect(TaskRepository.logActivity).toHaveBeenCalled();
      expect(NotificationService.notifyTaskAssignment).toHaveBeenCalled();
    });

    it('should throw error if user is not a manager', async () => {
      const mockTask = { id: 'task-123' };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.hasRole.mockReturnValue(false);

      await expect(
        TaskService.assignTask('task-123', 'user-456', { id: 'user-123', role: 'TEAM_MEMBER' })
      ).rejects.toThrow('Only managers can assign tasks');
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskId = 'task-123';
      const user = { id: 'user-123', role: 'ADMIN' };
      
      const mockTask = {
        id: taskId,
        title: 'Test Task',
        createdBy: user.id
      };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.canDeleteTask.mockReturnValue(true);
      TaskRepository.logActivity.mockResolvedValue({});
      TaskRepository.delete.mockResolvedValue(true);

      const result = await TaskService.deleteTask(taskId, user);

      expect(result.message).toBe('Task deleted successfully');
      expect(TaskRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('should throw error if user lacks permission to delete', async () => {
      const mockTask = {
        id: 'task-123',
        createdBy: 'other-user'
      };

      TaskRepository.findById.mockResolvedValue(mockTask);
      PermissionService.canDeleteTask.mockReturnValue(false);

      await expect(
        TaskService.deleteTask('task-123', { id: 'user-123', role: 'TEAM_MEMBER' })
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
