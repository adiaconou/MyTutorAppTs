import { UserChatSession } from "../models/UserChatSession";
import { GoogleCloudDatastore } from "./GoogleCloudDatastore";

const kind = "UserChatSession";

export class UserChatSessionRepository {
  private cloudDatastore;

  constructor(projectId: string) {
    this.cloudDatastore = new GoogleCloudDatastore<UserChatSession>(
      projectId,
      kind
    );
  }

  async create(id: string, session: UserChatSession): Promise<void> {
    this.cloudDatastore.put(id, session);
  }

  async get(id: string): Promise<UserChatSession | null> {
    return this.cloudDatastore.get(id);
}

  async getByUserId(
    userId: string
  ): Promise<UserChatSession[] | null> {
    const limit = 10;
    let nextPageToken = null;
    const indexName = "userId";
    const indexValue = userId;
    const sortKey = "createdAtUTC";

    let chatSessions: UserChatSession[] = [];

    do {
      const page: { entities: unknown[]; nextPageToken: string | null } = await this.cloudDatastore.getPage(
        limit,
        nextPageToken,
        indexName,
        indexValue,
        sortKey
      );
      const entities = page.entities;
      nextPageToken = page.nextPageToken;

      if (entities.length > 0) {
        chatSessions = chatSessions.concat(entities as UserChatSession[]);
      }
    } while (nextPageToken !== null);

    // sort chat sessions by createdAtUTC in ascending order
    chatSessions.sort(
      (a, b) => a.createdAtUTC.getTime() - b.createdAtUTC.getTime()
    );

    return chatSessions;
  }
}
