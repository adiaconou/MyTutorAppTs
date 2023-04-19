
import { UserSettings } from '../models/UserSettings';
import { GoogleCloudDatastore } from './GoogleCloudDatastore';

const kind = "UserSettings";

export class UserSettingsRepository {
    private cloudDatastore;

    constructor(projectId: string) {
        this.cloudDatastore = new GoogleCloudDatastore<UserSettings>(projectId, kind);
    }

    async getUserSettings(userId: string): Promise<UserSettings | null> {
        return this.cloudDatastore.get(userId);
    }

    async updateUserSettings(userId: string, userSettings: UserSettings): Promise<void> {
        this.cloudDatastore.put(userId, userSettings);
    }
}