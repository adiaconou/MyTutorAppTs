
import { Datastore, Key } from '@google-cloud/datastore';
import { UserSettings } from '../models/settingsModel';
import { ISettingsDataAccess } from '../interfaces/settingsDataAccess';

export class GoogleCloudDatastoreDataAccess implements ISettingsDataAccess {
    private datastore: Datastore;
    private kind: string;

    constructor(projectId: string) {
        this.datastore = new Datastore( {projectId});
        this.kind = 'UserSettings';
    }

    private userSettingsToEntity({ userSettings }: { userSettings: UserSettings; }): {key: Key; data: UserSettings} {
        const key = this.datastore.key([this.kind, userSettings.userId]);
        
        return {
            key,
            data: {
                userId: userSettings.userId,
                settings: userSettings.settings,
            },
        };
    }

    async getUserSettings(userId: string): Promise<UserSettings | null> {
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
        } catch (error) {
            console.error('Error fetching user settings: ', error);
            throw error;
        }
    }

    async updateUserSettings(userSettings: UserSettings): Promise<UserSettings> {
        const entity = this.userSettingsToEntity({ userSettings });

        try {
            await this.datastore.save(entity);
            return userSettings;
        } catch (error) {
            console.error('Error updating user settings: ', error);
            throw error;
        }
    }
}