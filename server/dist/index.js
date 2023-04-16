"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const googleCloudDatastoreDataAccess_1 = require("./dataAccess/googleCloudDatastoreDataAccess");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const dataAccess = new googleCloudDatastoreDataAccess_1.GoogleCloudDatastoreDataAccess('for-fun-153903');
app.get('/user-settings/:userId', async (req, res) => {
    try {
        console.log("GET USER ID");
        const userId = req.params.userId;
        console.log("Attempt data access " + userId);
        const userSettings = await dataAccess.getUserSettings(userId);
        console.log("res json");
        res.json(userSettings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user settings' });
    }
});
app.put('/user-settings/:userId', async (req, res) => {
    try {
        console.log("Setting userSettings");
        const userId = req.params.userId;
        const settings = req.body.settings;
        console.log("userId: " + userId);
        console.log("userSettings: " + settings);
        if (!settings) {
            res.status(400).json({ message: 'Invalid request data' });
            return;
        }
        const userSettings = {
            userId,
            settings,
        };
        console.log("Updating settings...");
        const updatedUserSettings = await dataAccess.updateUserSettings(userSettings);
        res.json(updatedUserSettings);
        console.log(updatedUserSettings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user settings' });
    }
});
app.listen(3001, () => {
    console.log('Backend server listening on port 3001');
});
