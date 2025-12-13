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
    codechef_username: { type: String, default: "" },
    codeforces_username: { type: String, default: "" },
    leetcode_username: { type: String, default: "" },
    bio: { type: String, default: "" },
    extra: { type: Schema.Types.Mixed }, // flexible for other fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "profiles" }
);

module.exports = mongoose.model("Profile", profileSchema);
