const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async updateContestRankingInfo(req, res) {
    try {
      const userId = req.user.id;
      const contestData = req.body;
      const result = await DashboardService.upsertContestRankingInfo(userId, contestData);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateTotalQuestions(req, res) {
    try {
      const userId = req.user.id;
      const questionsData = req.body;
      console.debug(`updateTotalQuestions received for user ${userId}:`, JSON.stringify(questionsData));
      const result = await DashboardService.upsertTotalQuestions(userId, questionsData);
      console.debug(`updateTotalQuestions result for user ${userId}:`, JSON.stringify(result));
      res.status(200).json(result);
    } catch (error) {
      console.error('updateTotalQuestions error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  static async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const result = await DashboardService.getDashboardData(userId);
      // Temporary debug: log the exact payload returned for the dashboard
      console.debug(`getDashboardData for user ${userId}:`, JSON.stringify(result, null, 2));
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;