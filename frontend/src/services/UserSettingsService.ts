import { UserSettings } from "../models/UserSettings";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    This is a service for the frontend to interact with UserSettings HTTP APIs
*/
export class UserSettingsService {

    // Get user's settings by user id
    async getUserSettings(userId: string, token: string): Promise<UserSettings | null> {
        const headers = this.createAuthHeaders(token);
        const response = await this.sendRequest(`${apiUrl}/userSettings/${userId}`, { method: "GET", headers });

        if (response.status === 404){
            return null;
        }
        
        try {
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Update user's settings
    async updateUserSettings(userSettings: UserSettings, token: string): Promise<void> {
        const headers = this.createAuthHeaders(token);
        headers.append("Content-Type", "application/json");

        try {
            await this.sendRequest(`${apiUrl}/userSettings/${userSettings.userId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(userSettings),
            });
        } catch (error) {
            console.error("Error updating UserSettings", error);
            throw error;
        }
    }

    // Send the http request to the server
    private async sendRequest(url: string, options: RequestInit): Promise<Response> {
        console.log(`[Request] ${options.method} ${url}`);
        return await fetch(url, options);
    }

    // Create the HTTP headers with auth
    private createAuthHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        return headers;
    }
}