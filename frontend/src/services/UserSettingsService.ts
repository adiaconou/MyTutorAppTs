import { UserSettings } from "../models/UserSettings";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    This is a service for the frontend to interact with UserSettings HTTP APIs
*/
export class UserSettingsService {

    // Get user's settings by user id
    async getUserSettings(userId: string, token: string): Promise<UserSettings | null> {
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);
        const response = await this.sendRequest(`${apiUrl}/userSettings/${userId}`, { headers });
        
        try {
            // Send HTTP request
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserSettings", error);
            throw error;
        }
    }

    // Update user's settings
    async updateUserSettings(userSettings: UserSettings, token: string): Promise<void> {
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);
        headers.append("Content-Type", "application/json");

        try {
            // Send HTTP request
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
        console.log(`Request URL: ${url}`);
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error status ${response.status}`);
        }
        return response;
    }

    // Create the HTTP headers with auth
    private createAuthHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        return headers;
    }
}