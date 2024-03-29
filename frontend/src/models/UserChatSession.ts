export interface UserChatSession {
  userId: string;
  id: string;
  createdAt: Date;
  lastUpdatedAt: Date;
  summary: string;
  sourceLanguage: string;
  targetLanguage: string;
}
