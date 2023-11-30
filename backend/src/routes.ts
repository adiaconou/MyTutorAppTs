import express from "express";
import { AuthController } from "./controllers/AuthController";
import passport from "passport";
import { UserSettingsController } from "./controllers/UserSettingsController";
import { UserChatSessionsController } from "./controllers/UserChatSessionsController";
import { UserChatMessagesController } from "./controllers/UserChatMessagesController";
import { CloudLogController } from "./controllers/CloudLogController";
import { SecretManager } from "./auth/SecretManager";
import config from "./config";
import { UserChatMessagesRepository } from "./repository/UserChatMessagesRepository";
import { UserChatSessionRepository } from "./repository/UserChatSessionRepository";
import { UserSettingsRepository } from "./repository/UserSettingsRepository";
import { checkJwt } from "./auth/JwtChecker";

const router = express.Router();
const authController = new AuthController(new SecretManager());
const cloudLogController = new CloudLogController(new SecretManager());
const userSettingsController = new UserSettingsController(new UserSettingsRepository(config.googleProjectId));
const userChatSessionsController = new UserChatSessionsController(new UserChatSessionRepository(config.googleProjectId));
const userChatMessagesController = new UserChatMessagesController(new UserChatMessagesRepository(config.googleProjectId));

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
router.get("/userSettings/:userId", checkJwt, userSettingsController.getUserSettings.bind(userSettingsController));router.put("/userSettings/:userId", userSettingsController.updateUserSettings.bind(userSettingsController));

// UserChatSessions routes
router.put("/chatSessions/:id", userChatSessionsController.createChatSession.bind(userChatSessionsController));
router.get("/chatSessions/:id", userChatSessionsController.getChatSessionById.bind(userChatSessionsController));
router.get("/chatSessions/", userChatSessionsController.getChatSessionsByUserId.bind(userChatSessionsController));
router.delete("/chatSessions/:id", userChatSessionsController.deleteChatSession.bind(userChatSessionsController));

// UserChatMessages routes
router.put("/messages/:id", userChatMessagesController.writeMessage.bind(userChatMessagesController));
router.get("/messages/", userChatMessagesController.getMessagesByUserId.bind(userChatMessagesController));

// Cloud logging routes
router.put("/log", cloudLogController.writeLog.bind(cloudLogController));

export default router;