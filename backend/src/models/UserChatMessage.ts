export interface UserChatMessage {
    id: string;
    chatSessionId: string;
    text: string;
    timestampUTC: Date;
    sender: 'user' | 'bot';
}