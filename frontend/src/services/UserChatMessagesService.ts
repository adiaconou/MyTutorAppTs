import { UserChatMessage } from "../models/UserChatMessage";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    Service to allow frontend to interact with UserChatMessages HTTP APIs
*/
export class UserChatMessagesService {
    // Function to get messages
    async getMessages(chatSessionId: string, limit: number, token: string): Promise<UserChatMessage[]> {
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);

        try {
            // Send HTTP request
            const response = await this.sendRequest(`${apiUrl}/messages/?chatSessionId=${encodeURIComponent(chatSessionId)}&limit=${limit}`, { method: "GET", headers });
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserChatMessages", error);
            throw error;
        }
    }

    // Write a chat message to the datastore
    async putNewMessage(displayableText: string, rawText: string, sender: string, chatSessionId: string, token: string, timestamp: Date, isVisibleToUser?: boolean): Promise<void> {
        const initialMessage: UserChatMessage = {
            id: uuidv4(),
            chatSessionId: chatSessionId,
            displayableText: displayableText,
            rawText: rawText,
            timestamp: timestamp,
            sender: sender,
            isVisibleToUser: isVisibleToUser,
        };
        // Create HTTP headers
        const headers = this.createAuthHeaders(token);
        headers.append("Content-Type", "application/json");
        
        try {
            // Send HTTP request
            await this.sendRequest(`${apiUrl}/messages/${initialMessage.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(initialMessage),
            });
        } catch (error) {
            console.error("Error writing UserChatMessage", error);
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