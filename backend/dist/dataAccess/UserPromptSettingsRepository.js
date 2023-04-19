"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPromptSettingsRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
const kind = "UserPromptSettings";
class UserPromptSettingsRepository {
    constructor(projectId) {
        this.cloudDatastore = new GoogleCloudDatastore_1.GoogleCloudDatastore(projectId, kind);
    }
    async getUserSettings(userId) {
        return this.cloudDatastore.get(userId);
    }
    async updateUserSettings(userId, userSettings) {
        this.cloudDatastore.put(userId, userSettings);
    }
}
exports.UserPromptSettingsRepository = UserPromptSettingsRepository;
