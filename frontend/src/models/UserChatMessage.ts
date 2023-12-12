export interface UserChatMessage {
    id: string;
    chatSessionId: string;
    displayableText: string;
    rawText: string;
    timestamp: Date;
    sender: string;
    isVisibleToUser?: boolean;
}