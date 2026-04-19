const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
  });
});
