import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    Class to allow the frontend to interact with UserChatSessions HTTP APIs
*/
export class UserChatSessionsService {

    // Create a new UserChatSession
    async createChatSession(email: string, chatSessionId: string, sourceLanguage: string, targetLanguage: string, userChatMessage: UserChatMessage, token: string): Promise<string> {
        // Create UserChatSession object
        const session: UserChatSession = {
            id: chatSessionId,
            userId: email,
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
            summary: chatSessionId,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage,
        };

        // Create http request body
        const requestBody = {
            session: {
                ...session,
                createdAt: session.createdAt.toISOString(),
                lastUpdatedAt: session.lastUpdatedAt.toISOString(),
            },
            initialMessage: {
                ...userChatMessage,
                timestamp: userChatMessage.timestamp.toISOString(),
            },
        };

        // Create HTTP headers
        const headers = this.createAuthHeaders(token);
        headers.append("Content-Type", "application/json");

        try {
            // Send HTTP request
            await this.sendRequest(`${apiUrl}/chatSessions/${session.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(requestBody),
            });
            return chatSessionId;
        } catch (error) {
            console.error("Error attempting to create UserChatSession", error);
            throw error;
        }
    }

    // Function to get chat sessions
    async getChatSessions(userId: string, limit: number, token: string): Promise<UserChatSession[]> {
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);

        try {
            // Send HTTP request
            const response = await this.sendRequest(`${apiUrl}/chatSessions/?userId=${encodeURIComponent(userId)}&limit=${limit}`, { method: "GET", headers });
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserChatSessions", error);
            throw error;
        }
    }

    async getChatSessionById(id: string, token: string): Promise<UserChatSession> {
        const headers = this.createAuthHeaders(token);

        try {
            const response = await this.sendRequest(`${apiUrl}/chatSessions/${id}`, { method: "GET", headers });
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserChatSession", error);
            throw error;
        }
    }

    // Delete a UserChatSession by chatSessionId
    async deleteChatSession(chatSessionId: string, token: string): Promise<void> {
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);

        try {
            // Send HTTP request
            await this.sendRequest(`${apiUrl}/chatSessions/${chatSessionId}`, { method: "DELETE", headers });
            console.log(`Deleted ChatSession {chatSessionId: ${chatSessionId}}`);
        } catch (error) {
            console.error("Error attempting to delete UserChatSession", error);
            throw error;
        }
    }

    // Send http request to server
    private async sendRequest(url: string, options: RequestInit): Promise<Response> {
        console.log(`[Request] ${options.method} ${url}`);
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error status ${response.status}`);
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