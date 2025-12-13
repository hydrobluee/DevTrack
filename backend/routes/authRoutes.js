const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authOAuthController = require("../controllers/authOAuthController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Google OAuth Routes
router.get("/google", authOAuthController.googleRedirect);
router.get("/google/callback", authOAuthController.googleCallback);

module.exports = router;
