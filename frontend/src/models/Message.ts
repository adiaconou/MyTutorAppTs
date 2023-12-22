export interface Message {
    displayableText: string;
    // Raw text from AI bot might be in JSON - 
    // this is necessary context for the model on each request, 
    // but we don't want to display raw JSON to users
    rawText: string; 
    isUser: boolean;
    isVisibleToUser?: boolean;
    timestamp: Date; 
  }