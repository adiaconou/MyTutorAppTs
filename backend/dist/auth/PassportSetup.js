"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const secret_manager_1 = require("@google-cloud/secret-manager");
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, "../../.env");
// Load the .env file
dotenv_1.default.config({ path: envPath });
const client = new secret_manager_1.SecretManagerServiceClient();
async function getSecret(secretName) {
    const [version] = await client.accessSecretVersion({
        name: `projects/${process.env.GOOGLE_PROJECT_ID}/secrets/${secretName}/versions/latest`,
    });
    // payload.data is of type Buffer, so toString can be safely called
    if (version.payload && version.payload.data) {
        // payload.data is of type Buffer, so toString can be safely called
        return version.payload.data.toString();
    }
    else {
        throw new Error('Payload or payload data is null or undefined.');
    }
}
async function initializePassport() {
    // const googleClientSecret = await getSecret('gcloud_oauth_client_secret');
    const googleClientSecret = "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";
    console.log("googleClientSecret: " + googleClientSecret);
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
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
