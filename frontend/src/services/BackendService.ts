import { UserChatSession } from "../models/UserChatSession";

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
}
