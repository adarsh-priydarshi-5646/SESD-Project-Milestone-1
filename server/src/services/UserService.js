const UserRepository = require('../repositories/UserRepository');
const AuthService = require('./AuthService');
const { ValidationError } = require('../utils/errors');

class UserService {
  async registerUser(userData) {
    // Validate user data
    this.validateUserData(userData);

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user
    const user = await UserRepository.save(userData);
    
    // Generate token
    const token = AuthService.generateToken(user);
    
    return { user, token };
  }

  async authenticateUser(email, password) {
    const user = await UserRepository.findByEmail(email);
    
    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ValidationError('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ValidationError('Invalid credentials');
    }

    const token = AuthService.generateToken(user);
    
    return { user, token };
  }

  async updateUser(userId, userData) {
    this.validateUserData(userData, true);
    
    const user = await UserRepository.update(userId, userData);
    if (!user) {
      throw new ValidationError('User not found');
    }
    
    return user;
  }

  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }
    return user;
  }

  async getAllUsers(filters = {}) {
    return await UserRepository.findAll(filters);
  }

  async deactivateUser(userId) {
    return await UserRepository.update(userId, { isActive: false });
  }

  validateUserData(userData, isUpdate = false) {
    if (!isUpdate) {
      if (!userData.email || !userData.password || !userData.name) {
        throw new ValidationError('Email, password, and name are required');
      }
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (userData.password && userData.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new UserService();
