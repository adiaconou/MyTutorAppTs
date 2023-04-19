export interface UserChatSessions {
    userId: string;

    id: string;
    chatSessionCreatedAtUTC: Date;
    chatSessionLastUpdatedAtUTC: Date;
    chatSessionSummary: string;
}