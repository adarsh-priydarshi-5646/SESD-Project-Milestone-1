const { sequelize, Task } = require('../../../src/models');

describe('Task Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('canBeUpdatedBy', () => {
    it('should allow assignee to update task', () => {
      const task = Task.build({
        id: 'task-123',
        assigneeId: 'user-123',
        createdBy: 'user-456'
      });

      expect(task.canBeUpdatedBy('user-123', 'TEAM_MEMBER')).toBe(true);
    });

    it('should allow creator to update task', () => {
      const task = Task.build({
        id: 'task-123',
        assigneeId: 'user-456',
        createdBy: 'user-123'
      });

      expect(task.canBeUpdatedBy('user-123', 'TEAM_MEMBER')).toBe(true);
    });

    it('should allow manager to update any task', () => {
      const task = Task.build({
        id: 'task-123',
        assigneeId: 'user-456',
        createdBy: 'user-789'
      });

      expect(task.canBeUpdatedBy('user-123', 'MANAGER')).toBe(true);
    });

    it('should allow admin to update any task', () => {
      const task = Task.build({
        id: 'task-123',
        assigneeId: 'user-456',
        createdBy: 'user-789'
      });

      expect(task.canBeUpdatedBy('user-123', 'ADMIN')).toBe(true);
    });

    it('should not allow other users to update task', () => {
      const task = Task.build({
        id: 'task-123',
        assigneeId: 'user-456',
        createdBy: 'user-789'
      });

      expect(task.canBeUpdatedBy('user-123', 'TEAM_MEMBER')).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('should return true if task is overdue', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = Task.build({
        id: 'task-123',
        dueDate: yesterday.toISOString().split('T')[0],
        status: 'TODO'
      });

      expect(task.isOverdue()).toBe(true);
    });

    it('should return false if task is not overdue', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const task = Task.build({
        id: 'task-123',
        dueDate: tomorrow.toISOString().split('T')[0],
        status: 'TODO'
      });

      expect(task.isOverdue()).toBe(false);
    });

    it('should return false if task is done', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const task = Task.build({
        id: 'task-123',
        dueDate: yesterday.toISOString().split('T')[0],
        status: 'DONE'
      });

      expect(task.isOverdue()).toBe(false);
    });

    it('should return false if no due date', () => {
      const task = Task.build({
        id: 'task-123',
        dueDate: null,
        status: 'TODO'
      });

      expect(task.isOverdue()).toBe(false);
    });
  });

  describe('changeStatus', () => {
    it('should allow valid status transition from TODO to IN_PROGRESS', () => {
      const task = Task.build({
        id: 'task-123',
        status: 'TODO'
      });

      expect(() => task.changeStatus('IN_PROGRESS')).not.toThrow();
      expect(task.status).toBe('IN_PROGRESS');
    });

    it('should allow valid status transition from IN_PROGRESS to IN_REVIEW', () => {
      const task = Task.build({
        id: 'task-123',
        status: 'IN_PROGRESS'
      });

      expect(() => task.changeStatus('IN_REVIEW')).not.toThrow();
      expect(task.status).toBe('IN_REVIEW');
    });

    it('should allow valid status transition from IN_REVIEW to DONE', () => {
      const task = Task.build({
        id: 'task-123',
        status: 'IN_REVIEW'
      });

      expect(() => task.changeStatus('DONE')).not.toThrow();
      expect(task.status).toBe('DONE');
    });

    it('should throw error for invalid status transition', () => {
      const task = Task.build({
        id: 'task-123',
        status: 'TODO'
      });

      expect(() => task.changeStatus('DONE')).toThrow('Invalid status transition');
    });

    it('should allow going back from IN_PROGRESS to TODO', () => {
      const task = Task.build({
        id: 'task-123',
        status: 'IN_PROGRESS'
      });

      expect(() => task.changeStatus('TODO')).not.toThrow();
      expect(task.status).toBe('TODO');
    });
  });
});
