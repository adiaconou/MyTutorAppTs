import { UserChatSession } from "../models/UserChatSession";
import { UserSettings } from "../models/UserSettings";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class BackendService {
  // Function to get chat sessions
  async getChatSessions(
    userId: string,
    limit: number
  ): Promise<UserChatSession[]> {
    try {
      const response = await fetch(
        `${apiUrl}/chatSessions/?userId=${encodeURIComponent(
          userId
        )}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions");
      }

      const sessions: UserChatSession[] = await response.json();
      return sessions;
    } catch (error) {
      console.error(`Error fetching chat sessions: ${error}`);
      return [];
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    console.log("URL: " + apiUrl + "/userSettings/" + userId);
    try {
      const response = await fetch(`${apiUrl}/userSettings/${userId}`);

      // Check if the response status code indicates success
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const userSettings: UserSettings = await response.json();

      return userSettings;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }
  }

  async updateUserSettings(userSettings: UserSettings): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/userSettings/${userSettings.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSettings),
      });

      if (!response.ok) {
        throw new Error('Error updating user settings');
      }
    } catch (error) {
      console.error(`Error attempting to update user settings: ${error}`);
    }
  }
}
