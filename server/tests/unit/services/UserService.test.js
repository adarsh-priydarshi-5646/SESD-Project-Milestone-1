const UserService = require('../../../src/services/UserService');
const UserRepository = require('../../../src/repositories/UserRepository');
const AuthService = require('../../../src/services/AuthService');
const { ValidationError } = require('../../../src/utils/errors');

jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/services/AuthService');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const mockUser = { id: '123', ...userData, password: 'hashed' };
      const mockToken = 'jwt_token';

      UserRepository.findByEmail.mockResolvedValue(null);
      UserRepository.save.mockResolvedValue(mockUser);
      AuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.registerUser(userData);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
      expect(UserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserRepository.save).toHaveBeenCalledWith(userData);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      };

      UserRepository.findByEmail.mockResolvedValue({ id: '123' });

      await expect(UserService.registerUser(userData)).rejects.toThrow(
        ValidationError
      );
      await expect(UserService.registerUser(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should throw error if required fields are missing', async () => {
      const userData = {
        email: 'test@example.com'
        // missing password and name
      };

      await expect(UserService.registerUser(userData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw error if email format is invalid', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      await expect(UserService.registerUser(userData)).rejects.toThrow(
        ValidationError
      );
      await expect(UserService.registerUser(userData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should throw error if password is too short', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      await expect(UserService.registerUser(userData)).rejects.toThrow(
        ValidationError
      );
      await expect(UserService.registerUser(userData)).rejects.toThrow(
        'Password must be at least 6 characters'
      );
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        id: '123',
        email,
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      const mockToken = 'jwt_token';

      UserRepository.findByEmail.mockResolvedValue(mockUser);
      AuthService.generateToken.mockReturnValue(mockToken);

      const result = await UserService.authenticateUser(email, password);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
    });

    it('should throw error if user not found', async () => {
      UserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        UserService.authenticateUser('nonexistent@example.com', 'password')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      UserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        UserService.authenticateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if account is deactivated', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        isActive: false
      };

      UserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        UserService.authenticateUser('test@example.com', 'password')
      ).rejects.toThrow('Account is deactivated');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = '123';
      const updateData = { name: 'Updated Name' };
      const mockUser = { id: userId, name: 'Updated Name' };

      UserRepository.update.mockResolvedValue(mockUser);

      const result = await UserService.updateUser(userId, updateData);

      expect(result).toEqual(mockUser);
      expect(UserRepository.update).toHaveBeenCalledWith(userId, updateData);
    });

    it('should throw error if user not found', async () => {
      UserRepository.update.mockResolvedValue(null);

      await expect(
        UserService.updateUser('nonexistent', { name: 'Test' })
      ).rejects.toThrow('User not found');
    });
  });
});
