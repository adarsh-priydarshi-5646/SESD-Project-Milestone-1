const DashboardService = require('../services/DashboardService');

class DashboardController {
  async getUserDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      
      const dashboard = await DashboardService.getUserDashboard(userId);
      
      res.status(200).json({
        success: true,
        data: { dashboard }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamDashboard(req, res, next) {
    try {
      const managerId = req.user.id;
      
      const dashboard = await DashboardService.getTeamDashboard(managerId);
      
      res.status(200).json({
        success: true,
        data: { dashboard }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
