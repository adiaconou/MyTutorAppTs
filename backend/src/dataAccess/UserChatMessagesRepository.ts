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
}
