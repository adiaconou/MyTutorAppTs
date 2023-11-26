import express from "express";
import { AuthController } from "./controllers/AuthController";
import passport from "passport";
import { UserSettingsController } from "./controllers/UserSettingsController";

const router = express.Router();
const authController = new AuthController();
const userSettingsController = new UserSettingsController();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect: "/auth/google/callback",
    failureRedirect: "http://localhost:3000/login", // Update this with your failure URL
    prompt: "consent"
  })
);

// Auth routes
router.get("/auth/google/callback", passport.authenticate("google"), authController.googleAuthCallback);
router.get('/auth/status', authController.checkAuthStatus);
router.post('/auth/logout', authController.logout);

// UserSettings routes
router.get("/userSettings/:userId", userSettingsController.getUserSettings.bind(userSettingsController));
router.put("/userSettings/:userId", userSettingsController.updateUserSettings.bind(userSettingsController));

export default router;