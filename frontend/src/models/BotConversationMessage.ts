export class BotConversationMessage {
    botResponse: string;
    translatedBotResponse: string;
    options: string[];

    constructor(botResponse: string, translatedBotResponse: string, options: string[]) {
        this.botResponse = botResponse;
        this.translatedBotResponse = translatedBotResponse;
        this.options = options;
    }

    public toChatString(): string {
        // The bot will not always respond with a set of options.
        if (this.options.length === 0) {
            return `${this.botResponse}`;
        }
        return `${this.botResponse}\n\n${this.options.join("\n")}`;
    }
}