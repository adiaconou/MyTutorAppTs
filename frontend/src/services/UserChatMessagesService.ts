import { UserChatMessage } from "../models/UserChatMessage";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    Service to allow frontend to interact with UserChatMessages HTTP APIs
*/
export class UserChatMessagesService {
    // Function to get messages
    async getMessages(chatSessionId: string, limit: number, token: string): Promise<UserChatMessage[]> {
        try {
            const headers = this.createAuthHeaders(token);
            const response = await this.sendRequest(`${apiUrl}/messages/?chatSessionId=${encodeURIComponent(chatSessionId)}&limit=${limit}`, { headers });
            return await response.json();
        } catch (error) {
            console.error("Error fetching UserChatMessages", error);
            throw error;
        }
    }

    // Write a chat message to the datastore
    async putNewMessage(text: string, sender: string, token: string): Promise<void> {
        try {
            const chatSessionId = sessionStorage.getItem("chatSessionId");
            if (!chatSessionId) return;

            const initialMessage: UserChatMessage = {
                id: uuidv4(),
                chatSessionId: chatSessionId,
                text: text,
                timestamp: new Date(),
                sender: sender,
            };

            const headers = this.createAuthHeaders(token);
            headers.append("Content-Type", "application/json");

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