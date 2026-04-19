const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

// Specific routes first (before :id)
router.get('/my-projects', ProjectController.getMyProjects);

// General routes
router.post('/', roleMiddleware('MANAGER', 'ADMIN'), ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.get('/:id/analytics', ProjectController.getProjectAnalytics);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.post('/:id/members', ProjectController.addMember);
router.delete('/:id/members/:userId', ProjectController.removeMember);

module.exports = router;
