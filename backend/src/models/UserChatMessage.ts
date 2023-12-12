export interface UserChatMessage {
    id: string;
    chatSessionId: string;
    displayableText: string;

    // rawText will be the same as displayableText if sneder = user.
    // Otherwise, rawText will be the JSON response from the AI.
    // Keeping the raw JSON is necessary context for the bot to
    // continue to respond according to the initial prompt instructions.
    rawText: string;
    timestamp: Date;
    sender: 'user' | 'bot';
    isVisibleToUser?: boolean; // default: true. If false, message will not be displayed to user.
}