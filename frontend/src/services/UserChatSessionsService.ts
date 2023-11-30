import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    Class to allow the frontend to interact with UserChatSessions HTTP APIs
*/
export class UserChatSessionsService {

    // Create a new UserChatSession
    async createChatSession(messageText: string, email: string, token: string): Promise<string> {
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

        try {
            const headers = this.createAuthHeaders(token);
            headers.append("Content-Type", "application/json");

            const response = await this.sendRequest(`${apiUrl}/chatSessions/${session.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(requestBody),
            });
            console.log(`Created new ChatSession {chatSessionId: ${chatSessionId}}`);
            return chatSessionId;
        } catch (error) {
            console.error("Error attempting to create UserChatSession", error);
            throw error;
        }
    }

    // Function to get chat sessions
    async getChatSessions(userId: string, limit: number, token: string): Promise<UserChatSession[]> {
        try {
            const headers = this.createAuthHeaders(token);
            const response = await this.sendRequest(`${apiUrl}/chatSessions/?userId=${encodeURIComponent(userId)}&limit=${limit}`, { headers });
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserChatSessions", error);
            throw error;
        }
    }

    // Delete a UserChatSession
    async deleteChatSession(chatSessionId: string, token: string): Promise<void> {
        try {
            const headers = this.createAuthHeaders(token);
            await this.sendRequest(`${apiUrl}/chatSessions/${chatSessionId}`, { method: "DELETE", headers });
            console.log(`Deleted ChatSession {chatSessionId: ${chatSessionId}}`);
        } catch (error) {
            console.error("Error attempting to delete UserChatSession", error);
            throw error;
        }
    }

    // Send http request to server
    private async sendRequest(url: string, options: RequestInit): Promise<Response> {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }
        return response;
    }

    // Create http headers with auth
    private createAuthHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        return headers;
    }
}