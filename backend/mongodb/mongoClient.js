const mongoose = require("mongoose");

const connectToMongo = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/cptracker";
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = { connectToMongo, mongoose };
