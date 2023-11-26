"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logging_1 = require("@google-cloud/logging");
const UserChatMessagesRepository_1 = require("./dataAccess/UserChatMessagesRepository");
const SecretManager_1 = require("./dataAccess/SecretManager");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./auth/PassportSetup");
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const secretManager = new SecretManager_1.SecretManager();
const app = (0, express_1.default)();
// Async function to initialize the app
async function initializeApp() {
    // Load the .env file
    const envPath = path_1.default.resolve(__dirname, "../.env");
    dotenv_1.default.config({ path: envPath });
    // Enable CORS for your frontend
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL,
        credentials: true
    }));
    // Other middleware setup
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    const sessionSecret = await getExpressUserSessionSecret();
    app.use((0, express_session_1.default)({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000, secure: 'auto' },
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.use(routes_1.default);
    // ... rest of your Express app setup ...
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Backend server listening on port ${PORT}`);
    });
}
// Call the async function to start the app
initializeApp().catch(console.error);
/********************/
const userMessageRepo = new UserChatMessagesRepository_1.UserChatMessagesRepository("for-fun-153903");
async function getExpressUserSessionSecret() {
    // Check if the application is running in a production environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        try {
            return await secretManager.accessSecretVersion("express_user_session_secret");
        }
        catch (error) {
            console.error('Error fetching express_user_session_secret from Secret Manager:', error);
            throw error; // You may want to handle this error gracefully
        }
    }
    else {
        // Fetch the Google Client ID from the local .env file during development
        return process.env.EXPRESS_USER_SESSION_SECRET || '';
    }
}
/*** Google Auth Routes ***/
app.post("/log", async (req, res) => {
    try {
        const secretName = "gcloud-logging-api-key";
        const keyFileContents = await secretManager.accessSecretVersion(secretName);
        const keyFileJson = JSON.parse(keyFileContents);
        // Initialize the Logging client with the parsed JSON credentials
        const logging = new logging_1.Logging({
            projectId: "for-fun-153903",
            credentials: keyFileJson,
        });
        const logName = "my-log";
        const log = logging.log(logName);
        const metadata = { resource: { type: "global" } };
        const logMessage = req.body.message;
        const entry = log.entry(metadata, { message: logMessage });
        await log.write(entry);
        res.status(200).send({ message: "Log entry created" });
    }
    catch (error) {
        console.error("Error accessing logging service account key from Secret Manager: ", error);
        res.status(500).send({ message: "Error writing log entry", error: error });
    }
});
/****************************************** */
app.put("/messages/:id", async (req, res) => {
    try {
        const id = req.body.id;
        const chatSessionId = req.body.chatSessionId;
        const text = req.body.text;
        const timestamp = req.body.timestamp;
        const sender = req.body.sender;
        const newMessage = {
            id,
            chatSessionId,
            text,
            timestamp,
            sender,
        };
        const updatedUserSettings = await userMessageRepo.add(id, newMessage);
        res.json(updatedUserSettings);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding new message" });
    }
});
app.get("/messages/", async (req, res) => {
    try {
        // Access query parameters using req.query
        const chatSessionId = req.query.chatSessionId;
        const limitStr = req.query.limit;
        // Validate query parameters
        if (!chatSessionId || !limitStr) {
            return res.status(400).json({ message: "Missing userId or limit" });
        }
        // Convert limit to an integer
        const limit = parseInt(limitStr, 10);
        // Check if limit is a valid number
        if (isNaN(limit)) {
            return res.status(400).json({ message: "Invalid limit" });
        }
        const session = await userMessageRepo.getById(chatSessionId, limit);
        res.json(session);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching chat session list " + error });
    }
});
