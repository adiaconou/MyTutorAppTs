export interface UserChatSession {
    userId: string;
    id: string;
    createdAt: Date;
    lastUpdatedAt: Date;
    summary: string;

    // source and target languages are stored in user settings,
    // but they cannot change within a single chat session because
    // the bot is prompted with these at the beginning of each session.
    // We must be able to recall the source and target language for
    // a given chat session for things like translations.
    sourceLanguage: string;
    targetLanguage: string;
}