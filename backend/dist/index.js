"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logging_1 = require("@google-cloud/logging");
const UserSettingsRepository_1 = require("./dataAccess/UserSettingsRepository");
const UserChatSessionRepository_1 = require("./dataAccess/UserChatSessionRepository");
const UserChatMessagesRepository_1 = require("./dataAccess/UserChatMessagesRepository");
const SecretManager_1 = require("./dataAccess/SecretManager");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const userSettingsRepo = new UserSettingsRepository_1.UserSettingsRepository("for-fun-153903");
const userChatSessionRepo = new UserChatSessionRepository_1.UserChatSessionRepository("for-fun-153903");
const userMessageRepo = new UserChatMessagesRepository_1.UserChatMessagesRepository("for-fun-153903");
const secretManager = new SecretManager_1.SecretManager("for-fun-153903");
const PORT = process.env.PORT || 3001;
app.post("/log", async (req, res) => {
    try {
        const secretName = "gcloud-logging-api-key"; // Replace with the name of the secret containing the logging service account key
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
app.get("/userSettings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const userSettings = await userSettingsRepo.getUserSettings(userId);
        res.json(userSettings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching user settings" });
    }
});
app.put("/userSettings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const settings = req.body.settings;
        if (!settings) {
            res.status(400).json({ message: "Invalid request data" });
            return;
        }
        const userSettings = {
            userId,
            settings,
        };
        const updatedUserSettings = await userSettingsRepo.updateUserSettings(userId, userSettings);
        console.log("success");
        res.json(updatedUserSettings);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user settings" });
        console.log("Server error: " + error);
    }
});
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
app.get("/chatSessions/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const session = await userChatSessionRepo.get(id);
        res.json(session);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching chat session" });
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
        res.status(500).json({ message: "Error fetching chat session list " + error });
    }
});
app.get("/chatSessions/", async (req, res) => {
    try {
        // Access query parameters using req.query
        const userId = req.query.userId;
        const limitStr = req.query.limit;
        // Validate query parameters
        if (!userId || !limitStr) {
            return res.status(400).json({ message: "Missing userId or limit" });
        }
        // Convert limit to an integer
        const limit = parseInt(limitStr, 10);
        // Check if limit is a valid number
        if (isNaN(limit)) {
            return res.status(400).json({ message: "Invalid limit" });
        }
        console.log("LIMIT: " + limit);
        const session = await userChatSessionRepo.getByUserId(userId, limit, 1);
        res.json(session);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching chat session list " + error });
    }
});
app.put("/chatSessions/:id", async (req, res) => {
    try {
        // Extract 'session' and 'initialMessage' from the request body
        const { session, initialMessage } = req.body;
        // Validate and destructure the 'session' object
        if (!session) {
            return res.status(400).json({ message: "Missing session object in request body" });
        }
        const { userId, id, createdAt, lastUpdatedAt, summary } = session;
        // Create the session object to be stored in the repository
        const sessionToCreate = {
            userId,
            id,
            createdAt: new Date(createdAt),
            lastUpdatedAt: new Date(lastUpdatedAt),
            summary,
        };
        // Validate and destructure the 'initialMessage' object (if needed)
        if (initialMessage) {
            const { id: messageId, chatSessionId, text, timestamp, sender } = initialMessage;
            // Create the initialMessage object to be stored in the repository (if needed)
            const messageToCreate = {
                id: messageId,
                chatSessionId,
                text,
                timestamp: new Date(timestamp),
                sender,
            };
            await userChatSessionRepo.createNew(sessionToCreate.id, sessionToCreate, initialMessage.id, initialMessage);
        }
        else {
            await userChatSessionRepo.create(id, session);
        }
        res.status(204).send();
    }
    catch (error) {
        console.log("Error creating chat session: " + error);
        res.status(500).json({ message: "Error creating chat session" });
    }
});
app.listen(PORT, () => {
    console.log("Backend server listening on port 3001");
});
