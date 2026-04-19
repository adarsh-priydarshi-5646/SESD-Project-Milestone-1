const express = require('express');
const DashboardController = require('../controllers/DashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/user', DashboardController.getUserDashboard);
router.get('/team', roleMiddleware('MANAGER', 'ADMIN'), DashboardController.getTeamDashboard);

module.exports = router;
