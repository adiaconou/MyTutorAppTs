
import { Datastore, Key } from '@google-cloud/datastore';
import { UserSettings } from '../models/settingsModel';
import { ISettingsDataAccess } from '../interfaces/settingsDataAccess';
import { GoogleCloudDatastore } from './GoogleCloudDatastore';

export class UserSettingsRepository {
    private cloudDatastore;

    constructor(projectId: string) {
        this.cloudDatastore = new GoogleCloudDatastore<UserSettings>(projectId, "UserSettings", "userId");
    }

    async getUserSettings(userId: string): Promise<UserSettings | null> {
        return this.cloudDatastore.get(userId);

    }

    async updateUserSettings(userSettings: UserSettings): Promise<void> {
        this.cloudDatastore.put(userSettings);
    }
}