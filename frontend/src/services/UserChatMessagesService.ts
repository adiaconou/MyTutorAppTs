import { UserChatMessage } from "../models/UserChatMessage";
import { v4 as uuidv4 } from "uuid";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

/*
    Service to allow frontend to interact with UserChatMessages HTTP APIs
*/
export class UserChatMessagesService {
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
                )}&limit=${limit}`, { headers: headers }
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
}