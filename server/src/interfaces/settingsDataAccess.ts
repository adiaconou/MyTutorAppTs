import { UserSettings } from '../models/settingsModel';
export interface ISettingsDataAccess {
    getUserSettings(userId: string): Promise<UserSettings | null>;
    updateUserSettings(userSettings: UserSettings): Promise<UserSettings>;
}