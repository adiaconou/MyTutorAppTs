
import { UserSettings } from '../models/settingsModel';
import { GoogleCloudDatastore } from './GoogleCloudDatastore';

export class UserSettingsRepository {
    private cloudDatastore;

    constructor(projectId: string) {
        this.cloudDatastore = new GoogleCloudDatastore<UserSettings>(projectId, "UserSettings", "userId");
    }

    async getUserSettings(userId: string): Promise<UserSettings | null> {
        console.log("getUserSettings");
        return this.cloudDatastore.get(userId);

    }

    async updateUserSettings(userId: string, userSettings: UserSettings): Promise<void> {
        this.cloudDatastore.put(userId, userSettings);
    }
}