"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logging_1 = require("@google-cloud/logging");
const UserSettingsRepository_1 = require("./dataAccess/UserSettingsRepository");
const SecretManager_1 = require("./dataAccess/SecretManager");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const dataAccess = new UserSettingsRepository_1.UserSettingsRepository('for-fun-153903');
const secretManager = new SecretManager_1.SecretManager('for-fun-153903');
const serviceAccountKeyLoggingPath = process.env.SERVICE_ACCOUNT_KEY_LOGGING;
const fs = require("fs");
app.post("/log", async (req, res) => {
    console.log("a");
    try {
        const secretName = 'gcloud-logging-api-key'; // Replace with the name of the secret containing the logging service account key
        const keyFileContents = await secretManager.accessSecretVersion(secretName);
        const keyFileJson = JSON.parse(keyFileContents);
        // Initialize the Logging client with the parsed JSON credentials
        const logging = new logging_1.Logging({
            projectId: 'for-fun-153903',
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
app.get("/user-settings/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const userSettings = await dataAccess.getUserSettings(userId);
        res.json(userSettings);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching user settings" });
    }
});
app.put("/user-settings/:userId", async (req, res) => {
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
        const updatedUserSettings = await dataAccess.updateUserSettings(userId, userSettings);
        res.json(updatedUserSettings);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user settings" });
    }
});
app.listen(3001, () => {
    console.log("Backend server listening on port 3001");
});