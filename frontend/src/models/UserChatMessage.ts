export interface UserChatMessage {
    id: string;
    chatSessionId: string;
    text: string;
    timestamp: Date;
    sender: string;
}