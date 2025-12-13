const User = require("../models/User");
const Profile = require("../models/Profile");

class userService {
  static async updateProfile(id, profileData) {
    const updated = await Profile.findOneAndUpdate(
      { userId: id },
      { ...profileData, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return updated;
  }

  static async getEmail(id) {
    const user = await User.findById(id).lean();
    if (!user) throw new Error("User not found");
    return user.email;
  }

  static async getProfile(id) {
    const profile = await Profile.findOne({ userId: id }).lean();
    return profile;
  }
}

module.exports = userService;
