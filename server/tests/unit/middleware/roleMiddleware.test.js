const roleMiddleware = require('../../../src/middleware/roleMiddleware');

describe('Role Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should allow user with correct role', () => {
    req.user = { id: '123', role: 'ADMIN' };
    
    const middleware = roleMiddleware('ADMIN', 'MANAGER');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should allow user with one of multiple allowed roles', () => {
    req.user = { id: '123', role: 'MANAGER' };
    
    const middleware = roleMiddleware('ADMIN', 'MANAGER');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should reject user without correct role', () => {
    req.user = { id: '123', role: 'TEAM_MEMBER' };
    
    const middleware = roleMiddleware('ADMIN', 'MANAGER');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'You do not have permission to access this resource',
        statusCode: 403
      })
    );
  });

  it('should reject request without user', () => {
    const middleware = roleMiddleware('ADMIN');
    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not authenticated',
        statusCode: 403
      })
    );
  });
});
