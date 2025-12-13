const userService = require('../services/userService');

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profileData = req.body;

    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updatedProfile = await userService.updateProfile(id, profileData);
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to access this profile' });
    }

    const profile = await userService.getProfile(id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmail = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ error: 'Unauthorized to access this email' });
    }

    const email = await userService.getEmail(id);
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};