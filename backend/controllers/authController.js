const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const TOKEN_EXPIRY = "7d";

exports.signup = async (req, res) => {
  try {
    let { email, password, name } = req.body;
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    name = typeof name === "string" ? name.trim() : "";
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    // create profile
    const profile = await Profile.create({ userId: user._id });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
      access_token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
      access_token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
