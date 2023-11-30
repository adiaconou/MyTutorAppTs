import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import { UserSettings } from "../models/UserSettings";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class BackendService {
  

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

  // Function to get messages
  async getMessages(
    chatSessionId: string,
    limit: number, 
    token: string
  ): Promise<UserChatMessage[]> {
    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);

      const response = await fetch(
        `${apiUrl}/messages/?chatSessionId=${encodeURIComponent(
          chatSessionId
        )}&limit=${limit}`, {headers: headers}
      );

      console.log("Getting messages: " + chatSessionId);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const messageList: UserChatMessage[] = await response.json();

      return messageList;
    } catch (error) {
      console.error(`Error fetching chat messages: ${error}`);
      return [];
    }
  }

  // Store a UserChatMessage
  async putNewMessage(text: string, sender: string, token: string): Promise<void> {
    try {
      const chatSessionId = sessionStorage.getItem("chatSessionId");

      console.log("Chat Session ID: " + chatSessionId);

      if (chatSessionId == null) {
        return;
      }

      const initialMessage: UserChatMessage = {
        id: uuidv4(),
        chatSessionId: chatSessionId,
        text: text,
        timestamp: new Date(),
        sender: sender,
      };

      const response = await fetch(`${apiUrl}/messages/${initialMessage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(initialMessage),
      });

      if (!response.ok) {
        throw new Error("Response not ok");
      }
    } catch (error) {
      console.error(`Error attempting to update user chat: ${error}`);
    }
  }

  // Create Google Cloud Log
  async sendLogToBackend(logMessage: string, token: string): Promise<void> {
    const response = await fetch(`${apiUrl}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: logMessage }),
    });

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    const result = await response.json();

    console.log("Result: " + result);
  }
}
