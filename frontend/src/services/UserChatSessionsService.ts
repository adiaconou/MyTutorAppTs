import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class UserChatSessionsService {

    // Create a new UserChatSession
    async createChatSession(messageText: string, email: string, token: string): Promise<string> {
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
                    "Authorization": `Bearer ${token}`,
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
        limit: number,
        token: string
    ): Promise<UserChatSession[]> {
        console.log(apiUrl);
        try {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);

            const response = await fetch(
                `${apiUrl}/chatSessions/?userId=${encodeURIComponent(
                    userId
                )}&limit=${limit}`, { headers: headers }
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

    // Delete a UserChatSession
    async deleteChatSession(chatSessionId: string, token: string): Promise<void> {
        try {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);
            const response = await fetch(`${apiUrl}/chatSessions/${chatSessionId}`, {
                method: "DELETE", headers: {
                    "Authorization": `Bearer ${token}`,
                },
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