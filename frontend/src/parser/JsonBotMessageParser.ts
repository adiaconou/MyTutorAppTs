import { BotConversationMessage } from "../models/BotConversationMessage";

export class JsonBotMessageParser {
    public static getBotMessage(jsonString: string) : BotConversationMessage {
        const botMessage = JSON.parse(jsonString) as BotConversationMessage;
        return JSON.parse(jsonString) as BotConversationMessage;
    }
}