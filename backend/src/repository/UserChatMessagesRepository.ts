import { UserChatMessage } from "../models/UserChatMessage";
import { GoogleCloudDatastore } from "./GoogleCloudDatastore";

const kind = "UserChatMessage";

export class UserChatMessagesRepository {
  private cloudDatastore;

  constructor(projectId: string) {
    this.cloudDatastore = new GoogleCloudDatastore<UserChatMessage>(
      projectId,
      kind
    );
  }

  async get(userId: string): Promise<UserChatMessage | null> {
    return this.cloudDatastore.get(userId);
  }

  async getById(id: string, limit: number): Promise<UserChatMessage[] | null> {
    let nextPageToken = null;
    const indexName = "chatSessionId";
    const indexValue = id;
    const sortKey = "timestamp";

    let chatMessages: UserChatMessage[] = [];

    do {
      const page: { entities: unknown[]; nextPageToken: string | null } =
        await this.cloudDatastore.getPage(
          limit,
          nextPageToken,
          indexName,
          indexValue,
          sortKey
        );
      const entities = page.entities;
      nextPageToken = page.nextPageToken;

      if (entities.length > 0) {
        chatMessages = chatMessages.concat(entities as UserChatMessage[]);
      }
    } while (nextPageToken !== null);

    // Sort chat messages by timestamp in ascending order
    chatMessages.sort((a, b) => {
      // Convert string timestamps to Date objects
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      // Compare timestamps and sort in ascending order
      return dateA.getTime() - dateB.getTime();
    });

    return chatMessages;
  }

  async add(id: string, message: UserChatMessage): Promise<void> {
    this.cloudDatastore.put(id, message);
  }

  async addMultiple(messages: UserChatMessage[]): Promise<void> {
    const promises = messages.map(message => 
      this.cloudDatastore.put(message.id, message)
    );
    await Promise.all(promises);
  }

  async getMessageIdsForSession(sessionId: string): Promise<string[]> {
    const messages = await this.getById(sessionId, 10000); // Adjust limit as needed
    return messages ? messages.map(message => message.id) : [];
  }
}
