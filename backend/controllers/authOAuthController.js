const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback";

if (!clientId || !clientSecret) {
  console.warn(
    "Google OAuth client id / secret not set - OAuth routes will not work until configured."
  );
}

const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

exports.googleRedirect = async (req, res) => {
  const scopes = ["profile", "email"];
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // fetch userinfo
    const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    let { email, name } = data;
    if (!email)
      return res.status(400).send("Email not available from Google profile");

    email = email.trim().toLowerCase();
    name = typeof name === "string" ? name.trim() : "";

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      // Create a placeholder passwordHash as it's required by schema
      user = await User.create({ email, passwordHash: "", name });
      await Profile.create({ userId: user._id });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // redirect to frontend with token (or deliver JSON if desired)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = `${frontendUrl}/auth-callback?token=${token}&id=${user._id.toString()}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google callback error:", err);
    return res.status(500).send("Internal server error");
  }
};
