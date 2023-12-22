import { Message } from "./Message";

export interface Session {
    id: string;
    sourceLanguage: string;
    targetLanguage: string;
    isSaved:boolean;
    messages:Message[];
}