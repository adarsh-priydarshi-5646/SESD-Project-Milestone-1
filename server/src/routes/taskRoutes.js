const express = require('express');
const TaskController = require('../controllers/TaskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// Specific routes first (before :id)
router.post('/', TaskController.createTask);
router.get('/my-tasks', TaskController.getMyTasks);
router.get('/project/:projectId', TaskController.getProjectTasks);

// General routes
router.get('/', TaskController.getAllTasks);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/status', TaskController.updateTaskStatus);
router.patch('/:id/assign', TaskController.assignTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
