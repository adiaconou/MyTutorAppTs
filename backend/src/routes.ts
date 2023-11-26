import express from "express";
import { AuthController } from "./controllers/AuthController";
import passport from "passport";
import { UserSettingsController } from "./controllers/UserSettingsController";
import { ChatSessionsController } from "./controllers/ChatSessionsController";

const router = express.Router();
const authController = new AuthController();
const userSettingsController = new UserSettingsController();
const chatSessionsController = new ChatSessionsController();

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

// UserChatSessions routes
router.put("/chatSessions/:id", chatSessionsController.createChatSession.bind(chatSessionsController));
router.get("/chatSessions/:id", chatSessionsController.getChatSessionById.bind(chatSessionsController));
router.get("/chatSessions/", chatSessionsController.getChatSessionsByUserId.bind(chatSessionsController));
router.delete("/chatSessions/:id", chatSessionsController.deleteChatSession.bind(chatSessionsController));

export default router;