import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import { UserSettings } from "../models/UserSettings";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class BackendService {
  // Create a new UserChatSession
  async createChatSession(messageText: string, email: string): Promise<string> {
    try {
      if (!email) {
        throw Error(
          "Unable to create a new chat session because email address is unavailable"
        );
      }

      let chatSessionId = uuidv4();

      // Create UserChatSession object
      const session: UserChatSession = {
        id: chatSessionId,
        userId: email,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        summary: chatSessionId,
      };

      // Create UserChatMessage object. A chat session is only
      // created when a user sends the first message.
      const initialMessage: UserChatMessage = {
        id: uuidv4(),
        chatSessionId: chatSessionId,
        text: messageText,
        timestamp: new Date(),
        sender: "user",
      };

      // Create http request body
      const requestBody = {
        session: {
          ...session,
          createdAt: session.createdAt.toISOString(),
          lastUpdatedAt: session.lastUpdatedAt.toISOString(),
        },
        initialMessage: {
          ...initialMessage,
          timestamp: initialMessage.timestamp.toISOString(),
        },
      };

      // Send the http request
      const response = await fetch(`${apiUrl}/chatSessions/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check http response
      if (!response.ok) {
        throw new Error("Response not ok");
      }
      console.log(`Created new ChatSession {chatSessionId: ${chatSessionId}}`);
      return chatSessionId;
    } catch (error) {
      console.error(`Error attempting to update user chat: ${error}`);
      return "";
    }
  }

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

  // Get UserSettings
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

  // Update UserSettings
  async updateUserSettings(userSettings: UserSettings): Promise<void> {
    try {
      const response = await fetch(
        `${apiUrl}/userSettings/${userSettings.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
    limit: number
  ): Promise<UserChatMessage[]> {
    try {
      const response = await fetch(
        `${apiUrl}/messages/?chatSessionId=${encodeURIComponent(
          chatSessionId
        )}&limit=${limit}`
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
  async putNewMessage(text: string, sender: string): Promise<void> {
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
  async sendLogToBackend(logMessage: string): Promise<void> {
    const response = await fetch(`${apiUrl}/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: logMessage }),
    });

    const result = await response.json();
    console.log("Result: " + result);
  }

  // Delete a UserChatSession
  async deleteChatSession(chatSessionId: string): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/chatSessions/${chatSessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat session");
      }
      console.log(`Deleted ChatSession {chatSessionId: ${chatSessionId}}`);
    } catch (error) {
      console.error(`Error attempting to delete chat session: ${error}`);
    }
  }
}
