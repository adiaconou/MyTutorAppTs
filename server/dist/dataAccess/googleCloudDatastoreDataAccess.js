"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudDatastoreDataAccess = void 0;
const datastore_1 = require("@google-cloud/datastore");
class GoogleCloudDatastoreDataAccess {
    constructor(projectId) {
        this.datastore = new datastore_1.Datastore({ projectId });
        this.kind = 'UserSettings';
    }
    userSettingsToEntity({ userSettings }) {
        const key = this.datastore.key([this.kind, userSettings.userId]);
        return {
            key,
            data: {
                userId: userSettings.userId,
                settings: userSettings.settings,
            },
        };
    }
    async getUserSettings(userId) {
        const key = this.datastore.key([this.kind, userId]);
        console.log("Key: " + key);
        try {
            const [userSettingsData] = await this.datastore.get(key);
            console.log("response!");
            if (!userSettingsData) {
                console.log("null");
                return null;
            }
            console.log("not null!");
            return {
                userId: userSettingsData[this.datastore.KEY].name,
                settings: userSettingsData.settings,
            };
        }
        catch (error) {
            console.error('Error fetching user settings: ', error);
            throw error;
        }
    }
    async updateUserSettings(userSettings) {
        const entity = this.userSettingsToEntity({ userSettings });
        try {
            await this.datastore.save(entity);
            return userSettings;
        }
        catch (error) {
            console.error('Error updating user settings: ', error);
            throw error;
        }
    }
}
exports.GoogleCloudDatastoreDataAccess = GoogleCloudDatastoreDataAccess;
