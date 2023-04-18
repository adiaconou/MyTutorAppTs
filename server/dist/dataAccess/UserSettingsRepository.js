"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
class UserSettingsRepository {
    constructor(projectId) {
        this.cloudDatastore = new GoogleCloudDatastore_1.GoogleCloudDatastore(projectId, "UserSettings", "userId");
    }
    async getUserSettings(userId) {
        console.log("getUserSettings");
        return this.cloudDatastore.get(userId);
    }
    async updateUserSettings(userId, userSettings) {
        this.cloudDatastore.put(userId, userSettings);
    }
}
exports.UserSettingsRepository = UserSettingsRepository;
