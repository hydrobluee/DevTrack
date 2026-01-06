const ContestRankingInfo = require("../models/ContestRankingInfo");
const TotalQuestions = require("../models/TotalQuestions");

class DashboardService {
  // Contest Ranking Info Methods
  static async upsertContestRankingInfo(userId, contestData) {
    // Merge incoming contestData with existing document fields and ignore null/undefined values
    const existing = await ContestRankingInfo.findOne({ userId }).lean();
    const prev = (existing && existing.rankingData) ? existing.rankingData : {};
    const filtered = Object.fromEntries(
      Object.entries(contestData || {}).filter(([_, v]) => v !== null && v !== undefined)
    );
    const merged = { ...prev, ...filtered };

    const doc = await ContestRankingInfo.findOneAndUpdate(
      { userId },
      { rankingData: merged, updatedAt: new Date() },
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
    // Merge incoming questionsData with existing document fields and ignore null/undefined values
    const existing = await TotalQuestions.findOne({ userId }).lean();
    const prev = (existing && existing.questionsData) ? existing.questionsData : {};

    // Filter out null/undefined values so they don't overwrite good existing data
    const filtered = Object.fromEntries(
      Object.entries(questionsData || {}).filter(([_, v]) => v !== null && v !== undefined)
    );

    const mergedQuestions = { ...prev, ...filtered };

    console.debug(`upsertTotalQuestions: user=${userId}, prev=${JSON.stringify(prev)}, filtered=${JSON.stringify(filtered)}, merged=${JSON.stringify(mergedQuestions)}`);

    const doc = await TotalQuestions.findOneAndUpdate(
      { userId },
      { questionsData: mergedQuestions, updatedAt: new Date() },
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
