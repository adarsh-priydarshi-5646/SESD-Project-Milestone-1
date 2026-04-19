const AuthService = require('../../../src/services/AuthService');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        role: 'TEAM_MEMBER'
      };

      const token = AuthService.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        role: 'MANAGER'
      };

      const token = AuthService.generateToken(user);
      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        role: 'TEAM_MEMBER'
      };

      const token = AuthService.generateToken(user);
      const decoded = AuthService.validateToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        AuthService.validateToken('invalid_token');
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for expired token', () => {
      const user = { id: '123', email: 'test@example.com', role: 'TEAM_MEMBER' };
      
      // Create token with immediate expiration
      const expiredToken = jwt.sign(user, process.env.JWT_SECRET || 'default_secret_change_in_production', {
        expiresIn: '0s'
      });

      // Wait a moment to ensure expiration
      setTimeout(() => {
        expect(() => {
          AuthService.validateToken(expiredToken);
        }).toThrow();
      }, 100);
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'plainpassword';
      const hashed = await AuthService.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'plainpassword';
      const hash1 = await AuthService.hashPassword(password);
      const hash2 = await AuthService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'plainpassword';
      const hashed = await AuthService.hashPassword(password);
      const isMatch = await AuthService.comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'plainpassword';
      const hashed = await AuthService.hashPassword(password);
      const isMatch = await AuthService.comparePassword('wrongpassword', hashed);

      expect(isMatch).toBe(false);
    });
  });
});
