export interface Message {
    text: string;
    isUser: boolean;
    isVisibleToUser?: boolean;
  }