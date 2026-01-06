const mongoose = require("mongoose");
const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Competitive programming usernames
    codechef_username: { type: String, default: "" },
    codeforces_username: { type: String, default: "" },
    leetcode_username: { type: String, default: "" },

    // Basic profile fields
    bio: { type: String, default: "" },
    gender: { type: String, default: "" },
    location: { type: String, default: "" },
    education: { type: String, default: "" },

    // Social / external profiles
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },

    // flexible for other fields
    extra: { type: Schema.Types.Mixed },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "profiles" }
);

module.exports = mongoose.model("Profile", profileSchema);
