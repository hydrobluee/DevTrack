import { motion } from "framer-motion";
import Header from "../components/Header";
import { useUserProfile } from "../context/UserProfileContext";
import { UserAuth } from "../context/AuthContext";
import { SiLeetcode, SiCodechef, SiCodeforces } from "react-icons/si";
import { MdVerified } from "react-icons/md";
import { FaFire } from "react-icons/fa6";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import CombinedHeatmap from "../components/CombinedHeatmap";

const Dashboard = () => {
  const { profileData } = useUserProfile();
  const { session } = UserAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  const user = {
    name: profileData?.name || "",
    email: profileData?.email || "",
    emailVerified: profileData?.emailVerified || true,
    linkedin: profileData?.linkedin || "",
    github: profileData?.github || "",
    organization: profileData?.education || "",
    location: profileData?.location || "",
    work: profileData?.work || "",
    codeforces_username: profileData?.codeforces_username || "",
    leetcode_username: profileData?.leetcode_username || "",
    codechef_username: profileData?.codechef_username || "",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/dashboard/${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE, session]);

  const getAvatar = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const getTotalQuestionsDoc = () => {
    const totals = dashboardData?.total_questions;
    if (!totals) return null;
    const doc = Array.isArray(totals) ? totals[0] : totals;
    return doc.questionsData ?? doc;
  };

  const getContestRankingDoc = () => {
    const rankingInfo = dashboardData?.contest_ranking_info;
    if (!rankingInfo) return null;
    const doc = Array.isArray(rankingInfo) ? rankingInfo[0] : rankingInfo;
    return doc.rankingData ?? doc;
  };

  const getTotalQuestionsSolved = () => {
    const totals = getTotalQuestionsDoc();
    if (!totals) return 0;
    return (
      (totals.leetcode_total || 0) +
      (totals.codechef_total || 0) +
      (totals.codeforces_total || 0)
    );
  };

  const getContestRating = (platform) => {
    const data = getContestRankingDoc();
    if (!data) return null;

    if (platform === "leetcode") {
      return {
        recent: data.leetcode_recent_contest_rating,
        max: data.leetcode_max_contest_rating,
      };
    }

    if (platform === "codechef") {
      return {
        stars: data.codechef_stars,
        recent: data.codechef_recent_contest_rating,
        max: data.codechef_max_contest_rating,
      };
    }

    if (platform === "codeforces") {
      return {
        recent: data.codeforces_recent_contest_rating,
        max: data.codeforces_max_contest_rating,
      };
    }

    return null;
  };

  const getPlatformQuestions = (platform) => {
    const totals = getTotalQuestionsDoc();
    if (!totals) return 0;
    return totals[`${platform}_total`] || 0;
  };

  const getLeetCodeBreakdown = () => {
    const data = getTotalQuestionsDoc();
    if (!data) return { easy: 0, medium: 0, hard: 0 };
    return {
      easy: data.leetcode_easy || 0,
      medium: data.leetcode_medium || 0,
      hard: data.leetcode_hard || 0,
    };
  };

  const leetCodeBreakdown = getLeetCodeBreakdown();
  const leetCodeRating = getContestRating("leetcode");
  const codechefRating = getContestRating("codechef");
  const codeforcesRating = getContestRating("codeforces");

  const platformStats = [
    {
      key: "leetcode",
      name: "LeetCode",
      icon: SiLeetcode,
      value: getPlatformQuestions("leetcode"),
      color: "text-[#f5a623]",
      bg: "bg-[#f5a623]/10",
      border: "border-[#f5a623]/30",
    },
    {
      key: "codechef",
      name: "CodeChef",
      icon: SiCodechef,
      value: getPlatformQuestions("codechef"),
      color: "text-[#ef4444]",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
    {
      key: "codeforces",
      name: "Codeforces",
      icon: SiCodeforces,
      value: getPlatformQuestions("codeforces"),
      color: "text-[#60a5fa]",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950">
      <Header />
      <div className="min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]"
        >
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/80 to-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center xl:items-start xl:text-left">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-4xl font-bold text-white shadow-2xl ring-4 ring-emerald-500/30">
                {getAvatar(user.name)}
              </div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="mt-1 break-all text-sm text-slate-400">{user.email}</p>
              {user.emailVerified && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <MdVerified size={16} />
                  Verified
                </div>
              )}
              {loading && (
                <p className="mt-4 text-xs text-slate-500">Refreshing dashboard data...</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-800/80 to-emerald-950/20 p-6 backdrop-blur-xl">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Total DSA Solved
                  </p>
                  <div className="mt-4 text-6xl font-bold leading-none text-emerald-400 sm:text-7xl">
                    {getTotalQuestionsSolved()}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    Combined solved count across all connected platforms
                  </p>
                </div>
                <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 xl:flex">
                  <span className="text-lg font-semibold text-emerald-300">DSA</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {platformStats.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.key}
                      className={`rounded-2xl border ${platform.border} ${platform.bg} p-4`}
                    >
                      <div className={`mb-3 flex items-center gap-2 ${platform.color}`}>
                        <Icon size={18} />
                        <span className="text-sm font-semibold">{platform.name}</span>
                      </div>
                      <div className="text-3xl font-bold text-white">{platform.value}</div>
                      <p className="mt-1 text-xs text-slate-400">{platform.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/80 to-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Difficulty Breakdown</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                LeetCode
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-200">Easy</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">{leetCodeBreakdown.easy}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-200">Medium</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">{leetCodeBreakdown.medium}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-200">Hard</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{leetCodeBreakdown.hard}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 backdrop-blur-xl"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Activity</h2>
          <CombinedHeatmap profileData={profileData} />
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 backdrop-blur-xl"
          >
            <h3 className="mb-8 flex items-center gap-2 text-2xl font-bold text-white">
              <FaFire className="text-emerald-400 text-xl" />
              Platform Breakdown
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {platformStats.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div
                    key={platform.key}
                    className={`rounded-2xl border ${platform.border} ${platform.bg} p-6`}
                  >
                    <div className={`mb-4 flex items-center gap-2 ${platform.color}`}>
                      <Icon size={20} />
                      <span className="text-base font-semibold">{platform.name}</span>
                    </div>
                    <div className="text-4xl font-bold text-white">{platform.value}</div>
                    <p className="mt-2 text-sm text-slate-400">Solved problems</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 backdrop-blur-xl"
          >
            <h3 className="mb-8 text-2xl font-bold text-white">Ratings</h3>

            <div className="space-y-5">
              {leetCodeRating && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <SiLeetcode className="text-yellow-400" size={18} />
                    <span className="text-sm font-medium text-slate-400">LeetCode</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{leetCodeRating.recent || "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">Current Rating</p>
                </div>
              )}

              {codechefRating && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <SiCodechef className="text-red-400" size={18} />
                    <span className="text-sm font-medium text-slate-400">CodeChef</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-red-400">{codechefRating.recent || "-"}</p>
                    {codechefRating.stars && (
                      <span className="text-lg text-yellow-400">{"★".repeat(codechefRating.stars)}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Current Rating</p>
                </div>
              )}

              {codeforcesRating && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <SiCodeforces className="text-blue-400" size={18} />
                    <span className="text-sm font-medium text-slate-400">CodeForces</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">{codeforcesRating.recent || "-"}</p>
                  <p className="mt-1 text-xs text-slate-500">Current Rating</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-8 backdrop-blur-xl"
        >
          <h3 className="mb-8 text-2xl font-bold text-white">Profile Information</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                Connect
              </h4>
              <div className="flex gap-3">
                {user.linkedin && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-600/20 p-3 transition-all hover:bg-emerald-600/40"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaLinkedin className="text-emerald-400" size={18} />
                      <span className="text-sm text-slate-200">LinkedIn</span>
                    </div>
                  </motion.a>
                )}
                {user.github && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-xl border border-slate-600/30 bg-slate-700/30 p-3 transition-all hover:bg-slate-700/50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaGithub className="text-slate-300" size={18} />
                      <span className="text-sm text-slate-200">GitHub</span>
                    </div>
                  </motion.a>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                Profiles
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.leetcode_username && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={`https://leetcode.com/u/${user.leetcode_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-3 py-2 text-sm font-medium text-yellow-300 transition-all hover:bg-yellow-500/40"
                  >
                    <SiLeetcode size={14} />
                    LeetCode
                  </motion.a>
                )}
                {user.codechef_username && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={`https://www.codechef.com/users/${user.codechef_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-2 text-sm font-medium text-red-300 transition-all hover:bg-red-500/40"
                  >
                    <SiCodechef size={14} />
                    CodeChef
                  </motion.a>
                )}
                {user.codeforces_username && (
                  <motion.a
                    whileHover={{ y: -2 }}
                    href={`https://codeforces.com/profile/${user.codeforces_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-2 text-sm font-medium text-blue-300 transition-all hover:bg-blue-500/40"
                  >
                    <SiCodeforces size={14} />
                    CodeForces
                  </motion.a>
                )}
              </div>
            </div>

            {user.location && (
              <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
                <p className="mb-1 text-xs text-slate-400">Location</p>
                <p className="text-sm font-semibold text-slate-200">{user.location}</p>
              </div>
            )}

            {user.organization && (
              <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
                <p className="mb-1 text-xs text-slate-400">Education</p>
                <p className="text-sm font-semibold text-slate-200">{user.organization}</p>
              </div>
            )}

            {user.work && (
              <div className="rounded-xl border border-slate-600/30 bg-slate-700/20 p-4">
                <p className="mb-1 text-xs text-slate-400">Work</p>
                <p className="text-sm font-semibold text-slate-200">{user.work}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
