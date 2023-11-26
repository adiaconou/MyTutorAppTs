import express from "express";
import { AuthController } from "./controllers/AuthController";
import passport from "passport";

const router = express.Router();
const authController = new AuthController();

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect: "/auth/google/callback",
    failureRedirect: "http://localhost:3000/login", // Update this with your failure URL
    prompt: "consent"
  })
);

router.get("/auth/google/callback", passport.authenticate("google"), authController.googleAuthCallback);
router.get('/auth/status', authController.checkAuthStatus);
router.post('/auth/logout', authController.logout);

export default router;