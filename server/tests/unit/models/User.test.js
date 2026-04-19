const { sequelize, User } = require('../../../src/models');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('Password Hashing', () => {
    it('should hash password before creating user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'plainpassword',
        role: 'TEAM_MEMBER'
      });

      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should hash password before updating user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'oldpassword',
        role: 'TEAM_MEMBER'
      });

      const oldHash = user.password;

      await user.update({ password: 'newpassword' });

      expect(user.password).not.toBe('newpassword');
      expect(user.password).not.toBe(oldHash);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'correctpassword',
        role: 'TEAM_MEMBER'
      });

      const isMatch = await user.comparePassword('correctpassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'correctpassword',
        role: 'TEAM_MEMBER'
      });

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for admin with any permission', () => {
      const admin = User.build({ role: 'ADMIN' });
      
      expect(admin.hasPermission('ANY_ACTION')).toBe(true);
      expect(admin.hasPermission('CREATE_PROJECT')).toBe(true);
    });

    it('should return true for manager with manager permissions', () => {
      const manager = User.build({ role: 'MANAGER' });
      
      expect(manager.hasPermission('CREATE_PROJECT')).toBe(true);
      expect(manager.hasPermission('ASSIGN_TASK')).toBe(true);
    });

    it('should return false for team member with manager permissions', () => {
      const teamMember = User.build({ role: 'TEAM_MEMBER' });
      
      expect(teamMember.hasPermission('CREATE_PROJECT')).toBe(false);
      expect(teamMember.hasPermission('ASSIGN_TASK')).toBe(false);
    });

    it('should return true for team member with team member permissions', () => {
      const teamMember = User.build({ role: 'TEAM_MEMBER' });
      
      expect(teamMember.hasPermission('VIEW_TASKS')).toBe(true);
      expect(teamMember.hasPermission('ADD_COMMENTS')).toBe(true);
    });
  });

  describe('isManager', () => {
    it('should return true for manager', () => {
      const manager = User.build({ role: 'MANAGER' });
      expect(manager.isManager()).toBe(true);
    });

    it('should return true for admin', () => {
      const admin = User.build({ role: 'ADMIN' });
      expect(admin.isManager()).toBe(true);
    });

    it('should return false for team member', () => {
      const teamMember = User.build({ role: 'TEAM_MEMBER' });
      expect(teamMember.isManager()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin', () => {
      const admin = User.build({ role: 'ADMIN' });
      expect(admin.isAdmin()).toBe(true);
    });

    it('should return false for manager', () => {
      const manager = User.build({ role: 'MANAGER' });
      expect(manager.isAdmin()).toBe(false);
    });

    it('should return false for team member', () => {
      const teamMember = User.build({ role: 'TEAM_MEMBER' });
      expect(teamMember.isAdmin()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should not include password in JSON', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'TEAM_MEMBER'
      });

      const json = user.toJSON();

      expect(json).not.toHaveProperty('password');
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('name');
    });
  });
});
