const authMiddleware = require('../../../src/middleware/authMiddleware');
const AuthService = require('../../../src/services/AuthService');
const UserRepository = require('../../../src/repositories/UserRepository');

jest.mock('../../../src/services/AuthService');
jest.mock('../../../src/repositories/UserRepository');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate user with valid token', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'TEAM_MEMBER',
      isActive: true
    };

    req.headers.authorization = 'Bearer valid_token';
    
    AuthService.validateToken.mockReturnValue({ id: '123' });
    UserRepository.findById.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith();
  });

  it('should reject request without token', async () => {
    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        statusCode: 401
      })
    );
  });

  it('should reject request with invalid token format', async () => {
    req.headers.authorization = 'InvalidFormat token';

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        statusCode: 401
      })
    );
  });

  it('should reject request with invalid token', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    
    AuthService.validateToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  it('should reject request if user not found', async () => {
    req.headers.authorization = 'Bearer valid_token';
    
    AuthService.validateToken.mockReturnValue({ id: '123' });
    UserRepository.findById.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not found',
        statusCode: 401
      })
    );
  });

  it('should reject request if user is inactive', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      role: 'TEAM_MEMBER',
      isActive: false
    };

    req.headers.authorization = 'Bearer valid_token';
    
    AuthService.validateToken.mockReturnValue({ id: '123' });
    UserRepository.findById.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Account is deactivated',
        statusCode: 401
      })
    );
  });
});
