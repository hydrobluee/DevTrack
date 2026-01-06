const User = require("../models/User");
const Profile = require("../models/Profile");

class userService {
  static async updateProfile(id, profileData) {
    // Update user-level fields (name, email) on the User model
    const userUpdates = {};
    if (profileData.name !== undefined) userUpdates.name = profileData.name;
    if (profileData.email !== undefined) userUpdates.email = profileData.email;

    let updatedUser = null;
    if (Object.keys(userUpdates).length > 0) {
      updatedUser = await User.findByIdAndUpdate(id, { ...userUpdates, updatedAt: new Date() }, { new: true }).lean();
    }

    // Remove user fields from profile payload so only profile-specific fields are updated on Profile
    const profileFields = { ...profileData };
    delete profileFields.name;
    delete profileFields.email;

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: id },
      { ...profileFields, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // Provide sane defaults and return merged data combining profile and user fields
    const defaults = {
      codechef_username: '',
      codeforces_username: '',
      leetcode_username: '',
      bio: '',
      gender: '',
      location: '',
      education: '',
      github: '',
      linkedin: '',
      name: '',
      email: '',
    };

    return {
      ...defaults,
      ...(updatedProfile || {}),
      ...(updatedUser ? { name: updatedUser.name, email: updatedUser.email } : {}),
    };
  }

  static async getEmail(id) {
    const user = await User.findById(id).lean();
    if (!user) throw new Error("User not found");
    return user.email;
  }

  static async getProfile(id) {
    const profile = await Profile.findOne({ userId: id }).lean();
    const user = await User.findById(id).lean();

    const defaults = {
      codechef_username: '',
      codeforces_username: '',
      leetcode_username: '',
      bio: '',
      gender: '',
      location: '',
      education: '',
      github: '',
      linkedin: '',
      name: '',
      email: '',
    };

    return {
      ...defaults,
      ...(profile || {}),
      name: user?.name || '',
      email: user?.email || '',
    };
  }
}

module.exports = userService;
