const mongoose = require("mongoose");
const { Schema } = mongoose;

const contestRankingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    rankingData: { type: Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "contest_ranking_info" }
);

module.exports = mongoose.model("ContestRankingInfo", contestRankingSchema);
