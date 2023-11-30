import { UserSettings } from "../models/UserSettings";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    This is a service for the frontend to interact with UserSettings HTTP APIs
*/
export class UserSettingsService {

    // Get UserSettings
    async getUserSettings(userId: string, token: string): Promise<UserSettings | null> {
        console.log("URL: " + apiUrl + "/userSettings/" + userId);
        try {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);

            const response = await fetch(`${apiUrl}/userSettings/${userId}`, { headers: headers });

            // Check if the response status code indicates success
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const userSettings: UserSettings = await response.json();
            return userSettings;
        } catch (error) {
            console.error("Error fetching user settings", error);
            return null;
        }
    }

    // Update UserSettings
    async updateUserSettings(userSettings: UserSettings, token: string): Promise<void> {
        try {

            const response = await fetch(
                `${apiUrl}/userSettings/${userSettings.userId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(userSettings),
                }
            );

            if (!response.ok) {
                throw new Error("Error updating user settings");
            }
        } catch (error) {
            console.error(`Error attempting to update user settings: ${error}`);
        }
    }
}