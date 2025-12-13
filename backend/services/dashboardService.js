const ContestRankingInfo = require("../models/ContestRankingInfo");
const TotalQuestions = require("../models/TotalQuestions");

class DashboardService {
  // Contest Ranking Info Methods
  static async upsertContestRankingInfo(userId, contestData) {
    const doc = await ContestRankingInfo.findOneAndUpdate(
      { userId },
      { rankingData: contestData, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return doc;
  }

  static async getContestRankingInfo(userId) {
    const doc = await ContestRankingInfo.findOne({ userId }).lean();
    return doc;
  }

  // Total Questions Methods
  static async upsertTotalQuestions(userId, questionsData) {
    const doc = await TotalQuestions.findOneAndUpdate(
      { userId },
      { questionsData, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return doc;
  }

  static async getTotalQuestions(userId) {
    const doc = await TotalQuestions.findOne({ userId }).lean();
    return doc;
  }

  // Combined Dashboard Data
  static async getDashboardData(userId) {
    const [contestData, questionsData] = await Promise.all([
      this.getContestRankingInfo(userId),
      this.getTotalQuestions(userId),
    ]);

    return {
      contest_ranking_info: contestData,
      total_questions: questionsData,
    };
  }
}

module.exports = DashboardService;
