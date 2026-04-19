const AuthService = require('../services/AuthService');
const UserRepository = require('../repositories/UserRepository');
const { UnauthorizedError } = require('../utils/errors');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    
    const decoded = AuthService.validateToken(token);
    
    const user = await UserRepository.findById(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message || 'Invalid token'));
  }
};

module.exports = authMiddleware;
