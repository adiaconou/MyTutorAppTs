"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const SecretManager_1 = require("./SecretManager");
const config_1 = __importDefault(require("../config"));
const secretManager = new SecretManager_1.SecretManager();
async function getGoogleClientId() {
    if (config_1.default.isProduction) {
        try {
            return await secretManager.accessSecretVersion("google_client_id");
        }
        catch (error) {
            console.error('Error fetching Google Client ID from Secret Manager:', error);
            throw error; // You may want to handle this error gracefully
        }
    }
    else {
        // Fetch the Google Client ID from the local .env file during development
        return config_1.default.googleClientId;
    }
}
async function initializePassport() {
    const googleClientSecret = "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";
    const googleClientId = await getGoogleClientId();
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: `${config_1.default.backendUrl}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        // Here, you can save the user information to your database.
        // For simplicity, we'll return the user profile.
        return done(null, profile);
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user);
    });
    passport_1.default.deserializeUser((user, done) => {
        done(null, user);
    });
}
initializePassport().catch(console.error);
