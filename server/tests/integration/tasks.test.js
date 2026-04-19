const request = require('supertest');
const app = require('../../src/server');
const { User, Project, Task } = require('../../src/models');

describe('Tasks API', () => {
  let token;
  let user;
  let project;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'MANAGER'
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginResponse.body.data.token;

    // Create a test project
    project = await Project.create({
      name: 'Test Project',
      description: 'Test Description',
      managerId: user.id,
      status: 'ACTIVE'
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        projectId: project.id,
        priority: 'HIGH',
        status: 'TODO'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task).toHaveProperty('id');
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.createdBy).toBe(user.id);
    });

    it('should not create task without authentication', async () => {
      const taskData = {
        title: 'Test Task',
        projectId: project.id
      };

      await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(401);
    });

    it('should not create task without title', async () => {
      const taskData = {
        projectId: project.id
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create task without projectId', async () => {
      const taskData = {
        title: 'Test Task'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks/my-tasks', () => {
    beforeEach(async () => {
      // Create some tasks
      await Task.create({
        title: 'Task 1',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'TODO',
        priority: 'MEDIUM'
      });

      await Task.create({
        title: 'Task 2',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH'
      });
    });

    it('should get user tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/my-tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/my-tasks?status=TODO')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(1);
      expect(response.body.data.tasks[0].status).toBe('TODO');
    });

    it('should not get tasks without authentication', async () => {
      await request(app)
        .get('/api/v1/tasks/my-tasks')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/tasks/:id/status', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'TODO',
        priority: 'MEDIUM'
      });
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.status).toBe('IN_PROGRESS');
    });

    it('should not update to invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent task', async () => {
      await request(app)
        .patch('/api/v1/tasks/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' })
        .expect(400);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'TODO',
        priority: 'MEDIUM'
      });
    });

    it('should update task', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        priority: 'HIGH'
      };

      const response = await request(app)
        .put(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.title).toBe(updateData.title);
      expect(response.body.data.task.priority).toBe(updateData.priority);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'TODO',
        priority: 'MEDIUM'
      });
    });

    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify task is deleted
      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });

    it('should not delete non-existent task', async () => {
      await request(app)
        .delete('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
        status: 'TODO',
        priority: 'MEDIUM'
      });
    });

    it('should get task by id', async () => {
      const response = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.id).toBe(task.id);
      expect(response.body.data.task.title).toBe(task.title);
    });

    it('should return 400 for non-existent task', async () => {
      await request(app)
        .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});
