import { createContext, useContext, useState, useEffect } from 'react';
import { UserAuth } from './AuthContext';
const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const { session } = UserAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/users/${session.user.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const responseData = await res.json();
        const data = Array.isArray(responseData) ? responseData[0] : responseData;
        setProfileData(data);
      } catch (err) {
        setError(err.message);
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // When profileData is present, proactively fetch platform stats and upsert dashboard totals
  useEffect(() => {
    const upsertPlatformStats = async () => {
      if (!session?.user || !profileData) return;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      };

      try {
        // LeetCode
        if (profileData.leetcode_username) {
          try {
            const res = await fetch(`${API_BASE}/api/leetcode/stats/${profileData.leetcode_username}`);
            if (res.ok) {
              const json = await res.json();
              const data = json?.data || {};
              const totalQuestionsData = {};
              if (typeof data.problemsSolved?.solvedStats?.submitStatsGlobal?.acSubmissionNum === 'object') {
                const all = data.problemsSolved.solvedStats.submitStatsGlobal;
                const easy = all.find(item => item.difficulty === 'Easy')?.count;
                const medium = all.find(item => item.difficulty === 'Medium')?.count;
                const hard = all.find(item => item.difficulty === 'Hard')?.count;
                const total = all.find(item => item.difficulty === 'All')?.count;
                if (typeof easy === 'number') totalQuestionsData.leetcode_easy = easy;
                if (typeof medium === 'number') totalQuestionsData.leetcode_medium = medium;
                if (typeof hard === 'number') totalQuestionsData.leetcode_hard = hard;
                if (typeof total === 'number') totalQuestionsData.leetcode_total = total;
              }

              if (Object.keys(totalQuestionsData).length > 0) {
                console.debug('auto-upsert leetcode totals', totalQuestionsData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/total-questions`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(totalQuestionsData),
                });
              }

              // contest rating
              const rating = data.contestRanking?.rating;
              if (Number.isFinite(Number(rating))) {
                const contestRankingData = {
                  leetcode_recent_contest_rating: Number(rating),
                  leetcode_max_contest_rating: Number(rating),
                };
                console.debug('auto-upsert leetcode ranking', contestRankingData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/contest-ranking`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(contestRankingData),
                });
              }
            }
          } catch (err) {
            console.debug('auto-upsert leetcode failed', err.message);
          }
        }

        // CodeForces
        if (profileData.codeforces_username) {
          try {
            const res = await fetch(`${API_BASE}/api/codeforces/profile/${profileData.codeforces_username}`);
            if (res.ok) {
              const data = await res.json();
              const totalQuestionsData = {};
              if (typeof data.totalSolved === 'number') totalQuestionsData.codeforces_total = data.totalSolved;
              if (Object.keys(totalQuestionsData).length > 0) {
                console.debug('auto-upsert codeforces totals', totalQuestionsData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/total-questions`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(totalQuestionsData),
                });
              }

              const rating = data.rating;
              const maxRating = data.maxRating;
              const contestRankingData = {};
              if (Number.isFinite(Number(rating))) contestRankingData.codeforces_recent_contest_rating = Number(rating);
              if (Number.isFinite(Number(maxRating))) contestRankingData.codeforces_max_contest_rating = Number(maxRating);
              if (Object.keys(contestRankingData).length > 0) {
                console.debug('auto-upsert codeforces ranking', contestRankingData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/contest-ranking`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(contestRankingData),
                });
              }
            }
          } catch (err) {
            console.debug('auto-upsert codeforces failed', err.message);
          }
        }

        // CodeChef
        if (profileData.codechef_username) {
          try {
            const res = await fetch(`${API_BASE}/api/codechef/profile/${profileData.codechef_username}/`);
            if (res.ok) {
              const data = await res.json();
              const totalQuestionsData = {};
              if (typeof data.profileInfo?.problemsSolved === 'number') totalQuestionsData.codechef_total = data.profileInfo.problemsSolved;
              if (Object.keys(totalQuestionsData).length > 0) {
                console.debug('auto-upsert codechef totals', totalQuestionsData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/total-questions`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(totalQuestionsData),
                });
              }

              const contestRankingData = {};
              const recent = Number.isFinite(Number(data.profileInfo?.rating)) ? Number(data.profileInfo.rating) : undefined;
              const maxR = Number.isFinite(Number(data.profileInfo?.highestRating)) ? Number(data.profileInfo.highestRating) : undefined;
              if (Number.isFinite(recent)) contestRankingData.codechef_recent_contest_rating = recent;
              if (Number.isFinite(maxR)) contestRankingData.codechef_max_contest_rating = maxR;
              if (typeof data.profileInfo?.stars === 'number') contestRankingData.codechef_stars = data.profileInfo.stars;

              if (Object.keys(contestRankingData).length > 0) {
                console.debug('auto-upsert codechef ranking', contestRankingData);
                await fetch(`${API_BASE}/api/dashboard/${session.user.id}/contest-ranking`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(contestRankingData),
                });
              }
            }
          } catch (err) {
            console.debug('auto-upsert codechef failed', err.message);
          }
        }
      } catch (err) {
        console.error('auto-upsert platforms error', err.message);
      }
    };

    upsertPlatformStats();
  }, [profileData, session]);

  return (
    <UserProfileContext.Provider value={{ profileData, setProfileData, loading, error }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);