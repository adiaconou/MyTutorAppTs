"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const SecretManager_1 = require("./SecretManager");
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, "../../.env");
// Load the .env file
dotenv_1.default.config({ path: envPath });
const secretManager = new SecretManager_1.SecretManager();
async function getGoogleClientId() {
    // Check if the application is running in a production environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
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
        return process.env.GOOGLE_CLIENT_ID || '';
    }
}
async function initializePassport() {
    const googleClientSecret = "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";
    const googleClientId = await getGoogleClientId();
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
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
