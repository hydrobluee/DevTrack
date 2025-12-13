const { connectToMongo, mongoose } = require("../mongodb/mongoClient");
const User = require("../models/User");
const Profile = require("../models/Profile");
const ContestRankingInfo = require("../models/ContestRankingInfo");
const TotalQuestions = require("../models/TotalQuestions");
const postgres = require("postgres");

(async () => {
  const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.SUPABASE_URL;
  const mongoUri = process.env.MONGODB_URI;
  if (!supabaseUrl || !mongoUri) {
    console.error("Please set SUPABASE_DB_URL and MONGODB_URI env vars.");
    process.exit(1);
  }

  // Connect to MongoDB
  await connectToMongo();

  // Connect to Supabase (postgres)
  const sqlClient = postgres(supabaseUrl, { ssl: "require" });

  try {
    console.log("Fetching users from Supabase...");
    const supaUsers = await sqlClient`select id, email from auth.users`;

    const supaToMongoMap = new Map();

    for (const u of supaUsers) {
      const existing = await User.findOne({ email: u.email }).lean();
      if (existing) {
        supaToMongoMap.set(u.id, existing._id);
        continue;
      }
      const created = await User.create({
        email: u.email,
        passwordHash: "",
        name: "",
      });
      supaToMongoMap.set(u.id, created._id);
    }

    console.log("Importing profiles...");
    const profiles = await sqlClient`select * from profiles`;
    for (const p of profiles) {
      const supaId = p.id; // supabase uses id as uuid
      const mappedId = supaToMongoMap.get(supaId);
      if (!mappedId) {
        console.warn("User not found for profile: ", supaId);
        continue;
      }
      const profileObj = {
        userId: mappedId,
        codechef_username: p.codechef_username || "",
        codeforces_username: p.codeforces_username || "",
        leetcode_username: p.leetcode_username || "",
        bio: p.bio || "",
        extra: p.extra || {},
      };
      await Profile.findOneAndUpdate({ userId: mappedId }, profileObj, {
        upsert: true,
        new: true,
      });
    }

    console.log("Importing contest ranking info...");
    const contests = await sqlClient`select * from contest_ranking_info`;
    for (const c of contests) {
      const mapped = supaToMongoMap.get(c.id);
      if (!mapped) {
        console.warn("User not found for contest ranking: ", c.id);
        continue;
      }
      await ContestRankingInfo.findOneAndUpdate(
        { userId: mapped },
        {
          rankingData: c.ranking_data || c.rankingData || {},
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    console.log("Importing total questions...");
    const totalQ = await sqlClient`select * from total_questions`;
    for (const t of totalQ) {
      const mapped = supaToMongoMap.get(t.id);
      if (!mapped) {
        console.warn("User not found for total questions: ", t.id);
        continue;
      }
      await TotalQuestions.findOneAndUpdate(
        { userId: mapped },
        {
          questionsData: t.questions_data || t.questionsData || {},
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
})();
