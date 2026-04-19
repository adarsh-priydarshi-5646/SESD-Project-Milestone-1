const request = require('supertest');
const app = require('../../src/server');
const { User, Project } = require('../../src/models');

describe('Projects API', () => {
  let managerToken;
  let teamMemberToken;
  let manager;
  let teamMember;

  beforeEach(async () => {
    // Create manager
    manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'password123',
      role: 'MANAGER'
    });

    // Create team member
    teamMember = await User.create({
      name: 'Team Member',
      email: 'member@example.com',
      password: 'password123',
      role: 'TEAM_MEMBER'
    });

    // Get tokens
    const managerLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'manager@example.com', password: 'password123' });
    managerToken = managerLogin.body.data.token;

    const memberLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'member@example.com', password: 'password123' });
    teamMemberToken = memberLogin.body.data.token;
  });

  describe('POST /api/v1/projects', () => {
    it('should create project as manager', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'PLANNING',
        deadline: '2024-12-31'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toHaveProperty('id');
      expect(response.body.data.project.name).toBe(projectData.name);
      expect(response.body.data.project.managerId).toBe(manager.id);
    });

    it('should not create project as team member', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(projectData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not create project without name', async () => {
      const projectData = {
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/projects/my-projects', () => {
    beforeEach(async () => {
      // Create projects for manager
      await Project.create({
        name: 'Project 1',
        managerId: manager.id,
        status: 'ACTIVE'
      });

      await Project.create({
        name: 'Project 2',
        managerId: manager.id,
        status: 'PLANNING'
      });
    });

    it('should get manager projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects/my-projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(2);
    });

    it('should return empty array for team member with no projects', async () => {
      const response = await request(app)
        .get('/api/v1/projects/my-projects')
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toHaveLength(0);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Test Project',
        managerId: manager.id,
        status: 'ACTIVE'
      });
    });

    it('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.id).toBe(project.id);
      expect(response.body.data.project.name).toBe(project.name);
    });

    it('should return 400 for non-existent project', async () => {
      await request(app)
        .get('/api/v1/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Test Project',
        managerId: manager.id,
        status: 'PLANNING'
      });
    });

    it('should update project', async () => {
      const updateData = {
        name: 'Updated Project',
        status: 'ACTIVE'
      };

      const response = await request(app)
        .put(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.name).toBe(updateData.name);
      expect(response.body.data.project.status).toBe(updateData.status);
    });

    it('should not update project without permission', async () => {
      const updateData = {
        name: 'Updated Project'
      };

      const response = await request(app)
        .put(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Test Project',
        managerId: manager.id,
        status: 'PLANNING'
      });
    });

    it('should delete project', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify project is deleted
      const deletedProject = await Project.findByPk(project.id);
      expect(deletedProject).toBeNull();
    });

    it('should not delete project without permission', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${project.id}`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/projects/:id/members', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Test Project',
        managerId: manager.id,
        status: 'ACTIVE'
      });
    });

    it('should add team member to project', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ userId: teamMember.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('added successfully');
    });

    it('should not add member without permission', async () => {
      const response = await request(app)
        .post(`/api/v1/projects/${project.id}/members`)
        .set('Authorization', `Bearer ${teamMemberToken}`)
        .send({ userId: teamMember.id })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/projects/:id/analytics', () => {
    let project;

    beforeEach(async () => {
      project = await Project.create({
        name: 'Test Project',
        managerId: manager.id,
        status: 'ACTIVE'
      });
    });

    it('should get project analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toHaveProperty('totalTasks');
      expect(response.body.data.analytics).toHaveProperty('completedTasks');
      expect(response.body.data.analytics).toHaveProperty('completionRate');
    });
  });
});
