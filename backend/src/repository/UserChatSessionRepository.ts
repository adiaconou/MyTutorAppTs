import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import { GoogleCloudDatastore } from "./GoogleCloudDatastore";
import { UserChatMessagesRepository } from "./UserChatMessagesRepository";

const kind = "UserChatSession";
const messageRepo = new UserChatMessagesRepository("for-fun-153903");

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

  async createNew(
    newSessionId: string,
    newSession: UserChatSession,
    initialMessageId: string,
    initialMessage: UserChatMessage
  ): Promise<void> {
    this.cloudDatastore.transactionalPut(
      "UserChatSession",
      newSessionId,
      newSession,
      "UserChatMessage",
      initialMessageId,
      initialMessage
    );
  }

  async saveNew(
    newSessionId: string,
    newSession: UserChatSession,
    initialMessages: UserChatMessage[]
  ): Promise<void> {
    try {
      // Prepare initialMessages for batch operation
      // Assuming each message does not have an ID and we need to assign one
      const preparedMessages = initialMessages.map(message => ({
        ...message,
      }));

      // Use the new transactionalPutArray method
      await this.cloudDatastore.transactionalPutArray(
        "UserChatSession",
        newSessionId,
        newSession,
        "UserChatMessage",
        preparedMessages
      );
    } catch (error) {
      console.error("Error saving new chat session and messages: ", error);
      throw error;
    }
  }


  async get(id: string): Promise<UserChatSession | null> {
    return this.cloudDatastore.get(id);
  }

  async getByUserId(
    userId: string,
    limit: number,
    maxPages?: number
  ): Promise<UserChatSession[] | null> {
    let nextPageToken = null;
    const indexName = "userId";
    const indexValue = userId;
    const sortKey = "createdAt";

    let chatSessions: UserChatSession[] = [];
    let currentPage = 0;

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
        chatSessions = chatSessions.concat(entities as UserChatSession[]);
      }

      currentPage++;
    } while (nextPageToken !== null && (!maxPages || currentPage < maxPages));

    return chatSessions;
  }

  async deleteSessionAndMessages(sessionId: string): Promise<void> {
    try {
      console.log("Beginning transaction...");
      // Begin a new transaction
      await this.cloudDatastore.beginTransaction();
  
      console.log("Deleting chat session...");
      // Delete the session
      await this.cloudDatastore.transactionalDelete([sessionId]);
  
      console.log("Getting message IDs...");
      // Get the IDs of the associated messages
      const messageIds = await messageRepo.getMessageIdsForSession(sessionId);
  
      console.log("Deleting messages...");
      // Delete the associated messages
      if (messageIds.length > 0) {
        await this.cloudDatastore.transactionalDelete(messageIds);
      }
  
      console.log("Committing transaction...");
      // Commit the transaction
      await this.cloudDatastore.commit();
    } catch (error) {
      // If there was an error, rollback the transaction
      console.log("Transaction failed. Rolling back...");
      await this.cloudDatastore.rollback();
      throw error;
    }
  }
}
