const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);

// Admin routes
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'MANAGER'), UserController.getAllUsers);
router.get('/:id', authMiddleware, UserController.getUserById);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), UserController.updateUser);
router.delete('/:id/deactivate', authMiddleware, roleMiddleware('ADMIN'), UserController.deactivateUser);

module.exports = router;
