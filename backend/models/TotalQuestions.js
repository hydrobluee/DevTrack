const mongoose = require("mongoose");
const { Schema } = mongoose;

const totalQuestionsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    questionsData: { type: Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "total_questions" }
);

module.exports = mongoose.model("TotalQuestions", totalQuestionsSchema);
