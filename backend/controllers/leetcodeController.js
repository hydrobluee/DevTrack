const leetcodeService = require('../services/leetcodeService');

class LeetcodeController {
  async getUserStats(req, res, next) {
    try {
      const { username } = req.params;
      const userStats = await leetcodeService.fetchUserComprehensiveData(username);
      if (!userStats) {
        return res.status(404).json({
          success: false,
          message: `No stats found for user: ${username}`
        });
      }
      res.json({
        success: true,
        data: userStats
      });
    } catch (error) {
      next(error);
    }
  }
  async getContestRating(req, res, next) {
    try {
      const { username } = req.params;
      const contestData = await leetcodeService.getUserContestRankingInfo(username);
      
      if (!contestData || !contestData.userContestRanking) {
        return res.status(404).json({
          success: false,
          message: `No contest data found for user: ${username}`
        });
      }
      
      res.json({
        success: true,
        data: {
          contestRanking: contestData.userContestRanking,
          contestHistory: contestData.userContestRankingHistory.filter(
            entry => entry && entry.attended === true
          )
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const { username } = req.params;
      const calendarData = await leetcodeService.getUserProfileCalendar(username);
      
      if (!calendarData || !calendarData.matchedUser || !calendarData.matchedUser.userCalendar) {
        return res.status(404).json({
          success: false,
          message: `No heatmap data found for user: ${username}`
        });
      }
      
      let submissionCalendar = {};
      try {
        if (calendarData.matchedUser.userCalendar.submissionCalendar) {
          submissionCalendar = JSON.parse(calendarData.matchedUser.userCalendar.submissionCalendar);
        }
      } catch (e) {
        console.error('Error parsing submission calendar:', e);
      }
      
      res.json({
        success: true,
        data: {
          activeYears: calendarData.matchedUser.userCalendar.activeYears,
          streak: calendarData.matchedUser.userCalendar.streak || 0,
          totalActiveDays: calendarData.matchedUser.userCalendar.totalActiveDays,
          dccBadges: calendarData.matchedUser.userCalendar.dccBadges || [],
          submissionCalendar: submissionCalendar
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProblemsSolved(req, res) {
    try {
      const { username } = req.params; // or req.query depending on your route setup
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required'
        });
      }

      const result = await getUserProblemsSolved(username);
      
      if (!result || !result.matchedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found or no data available'
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error fetching user problems solved:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get problem details and common solutions
   */
  async getProblemSolution(req, res, next) {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Problem slug is required'
        });
      }

      const problemData = await leetcodeService.getProblemDetails(slug);
      
      if (!problemData || !problemData.question) {
        return res.status(404).json({
          success: false,
          message: `Problem not found: ${slug}`
        });
      }

      // Extract relevant solution information
      const { question } = problemData;
      
      // Parse stats JSON string from GraphQL
      let statsData = {
        accepted: 0,
        submissions: 0,
        acceptanceRate: '0%'
      };
      
      try {
        if (typeof question.stats === 'string') {
          const parsedStats = JSON.parse(question.stats);
          statsData = {
            accepted: parsedStats.totalAcceptedRaw || parsedStats.totalAccepted || 0,
            submissions: parsedStats.totalSubmissionRaw || parsedStats.totalSubmission || 0,
            acceptanceRate: parsedStats.acRate || '0%'
          };
        }
      } catch (parseErr) {
        console.error('Error parsing stats:', parseErr);
      }
      
      // Also use acRate from question if available
      if (question.acRate) {
        statsData.acceptanceRate = question.acRate;
      }
      
      // Extract code snippets for common languages
      const codeSnippets = {};
      if (question.codeSnippets && Array.isArray(question.codeSnippets)) {
        question.codeSnippets.forEach(snippet => {
          if (['python3', 'java', 'javascript', 'cpp'].includes(snippet.langSlug)) {
            codeSnippets[snippet.langSlug] = {
              language: snippet.lang,
              code: snippet.code
            };
          }
        });
      }
      
      // Default solution approaches
      const solutions = [
        {
          approach: 'Brute Force',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          explanation: 'Basic solution with simple iteration'
        },
        {
          approach: 'Optimized',
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          explanation: 'Improved solution with better performance'
        }
      ];
      
      res.json({
        success: true,
        problem: {
          id: question.questionId,
          title: question.title,
          titleSlug: question.titleSlug,
          difficulty: question.difficulty,
          likes: question.likes,
          dislikes: question.dislikes,
          categoryTitle: question.categoryTitle,
          description: question.content || ''
        },
        stats: statsData,
        solutions: solutions,
        codeSnippets: codeSnippets
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new LeetcodeController();