const PermissionService = require('../../../src/services/PermissionService');

describe('PermissionService', () => {
  describe('checkPermission', () => {
    it('should allow admin to perform any action', () => {
      const admin = { id: '123', role: 'ADMIN' };
      
      expect(PermissionService.checkPermission(admin, 'CREATE_PROJECT')).toBe(true);
      expect(PermissionService.checkPermission(admin, 'DELETE_USER')).toBe(true);
      expect(PermissionService.checkPermission(admin, 'ANY_ACTION')).toBe(true);
    });

    it('should allow manager to create projects', () => {
      const manager = { id: '123', role: 'MANAGER' };
      
      expect(PermissionService.checkPermission(manager, 'CREATE_PROJECT')).toBe(true);
      expect(PermissionService.checkPermission(manager, 'ASSIGN_TASK')).toBe(true);
      expect(PermissionService.checkPermission(manager, 'VIEW_ANALYTICS')).toBe(true);
    });

    it('should not allow team member to create projects', () => {
      const teamMember = { id: '123', role: 'TEAM_MEMBER' };
      
      expect(PermissionService.checkPermission(teamMember, 'CREATE_PROJECT')).toBe(false);
      expect(PermissionService.checkPermission(teamMember, 'ASSIGN_TASK')).toBe(false);
    });

    it('should allow team member to view tasks', () => {
      const teamMember = { id: '123', role: 'TEAM_MEMBER' };
      
      expect(PermissionService.checkPermission(teamMember, 'VIEW_TASKS')).toBe(true);
      expect(PermissionService.checkPermission(teamMember, 'ADD_COMMENTS')).toBe(true);
    });
  });

  describe('canUpdateTask', () => {
    it('should allow admin to update any task', () => {
      const admin = { id: '123', role: 'ADMIN' };
      const task = { id: 'task-1', assigneeId: 'other-user', createdBy: 'other-user' };
      
      expect(PermissionService.canUpdateTask(admin, task)).toBe(true);
    });

    it('should allow manager to update any task', () => {
      const manager = { id: '123', role: 'MANAGER' };
      const task = { id: 'task-1', assigneeId: 'other-user', createdBy: 'other-user' };
      
      expect(PermissionService.canUpdateTask(manager, task)).toBe(true);
    });

    it('should allow assignee to update their task', () => {
      const user = { id: '123', role: 'TEAM_MEMBER' };
      const task = { id: 'task-1', assigneeId: '123', createdBy: 'other-user' };
      
      expect(PermissionService.canUpdateTask(user, task)).toBe(true);
    });

    it('should allow creator to update their task', () => {
      const user = { id: '123', role: 'TEAM_MEMBER' };
      const task = { id: 'task-1', assigneeId: 'other-user', createdBy: '123' };
      
      expect(PermissionService.canUpdateTask(user, task)).toBe(true);
    });

    it('should not allow other users to update task', () => {
      const user = { id: '123', role: 'TEAM_MEMBER' };
      const task = { id: 'task-1', assigneeId: 'other-user', createdBy: 'another-user' };
      
      expect(PermissionService.canUpdateTask(user, task)).toBe(false);
    });
  });

  describe('canDeleteTask', () => {
    it('should allow admin to delete any task', () => {
      const admin = { id: '123', role: 'ADMIN' };
      const task = { id: 'task-1', createdBy: 'other-user' };
      
      expect(PermissionService.canDeleteTask(admin, task)).toBe(true);
    });

    it('should allow manager to delete any task', () => {
      const manager = { id: '123', role: 'MANAGER' };
      const task = { id: 'task-1', createdBy: 'other-user' };
      
      expect(PermissionService.canDeleteTask(manager, task)).toBe(true);
    });

    it('should allow creator to delete their task', () => {
      const user = { id: '123', role: 'TEAM_MEMBER' };
      const task = { id: 'task-1', createdBy: '123' };
      
      expect(PermissionService.canDeleteTask(user, task)).toBe(true);
    });

    it('should not allow non-creator team member to delete task', () => {
      const user = { id: '123', role: 'TEAM_MEMBER' };
      const task = { id: 'task-1', createdBy: 'other-user' };
      
      expect(PermissionService.canDeleteTask(user, task)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has exact role', () => {
      const manager = { id: '123', role: 'MANAGER' };
      
      expect(PermissionService.hasRole(manager, 'MANAGER')).toBe(true);
    });

    it('should return true if user has higher role', () => {
      const admin = { id: '123', role: 'ADMIN' };
      
      expect(PermissionService.hasRole(admin, 'MANAGER')).toBe(true);
      expect(PermissionService.hasRole(admin, 'TEAM_MEMBER')).toBe(true);
    });

    it('should return false if user has lower role', () => {
      const teamMember = { id: '123', role: 'TEAM_MEMBER' };
      
      expect(PermissionService.hasRole(teamMember, 'MANAGER')).toBe(false);
      expect(PermissionService.hasRole(teamMember, 'ADMIN')).toBe(false);
    });
  });

  describe('canAccessProject', () => {
    it('should allow admin to access any project', () => {
      const admin = { id: '123', role: 'ADMIN' };
      const project = { id: 'project-1', managerId: 'other-user' };
      
      expect(PermissionService.canAccessProject(admin, project)).toBe(true);
    });

    it('should allow manager to access their project', () => {
      const manager = { id: '123', role: 'MANAGER' };
      const project = { id: 'project-1', managerId: '123' };
      
      expect(PermissionService.canAccessProject(manager, project)).toBe(true);
    });

    it('should not allow manager to access other projects', () => {
      const manager = { id: '123', role: 'MANAGER' };
      const project = { id: 'project-1', managerId: 'other-user' };
      
      expect(PermissionService.canAccessProject(manager, project)).toBe(false);
    });
  });
});
