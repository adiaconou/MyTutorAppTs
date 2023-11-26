"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatSessionRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
const UserChatMessagesRepository_1 = require("./UserChatMessagesRepository");
const kind = "UserChatSession";
const messageRepo = new UserChatMessagesRepository_1.UserChatMessagesRepository("for-fun-153903");
class UserChatSessionRepository {
    cloudDatastore;
    constructor(projectId) {
        this.cloudDatastore = new GoogleCloudDatastore_1.GoogleCloudDatastore(projectId, kind);
    }
    async create(id, session) {
        this.cloudDatastore.put(id, session);
    }
    async createNew(newSessionId, newSession, initialMessageId, initialMessage) {
        this.cloudDatastore.transactionalPut("UserChatSession", newSessionId, newSession, "UserChatMessage", initialMessageId, initialMessage);
    }
    async get(id) {
        return this.cloudDatastore.get(id);
    }
    async getByUserId(userId, limit, maxPages) {
        let nextPageToken = null;
        const indexName = "userId";
        const indexValue = userId;
        const sortKey = "createdAt";
        let chatSessions = [];
        let currentPage = 0;
        do {
            const page = await this.cloudDatastore.getPage(limit, nextPageToken, indexName, indexValue, sortKey);
            const entities = page.entities;
            nextPageToken = page.nextPageToken;
            if (entities.length > 0) {
                chatSessions = chatSessions.concat(entities);
            }
            currentPage++;
        } while (nextPageToken !== null && (!maxPages || currentPage < maxPages));
        return chatSessions;
    }
    async deleteSessionAndMessages(sessionId) {
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
        }
        catch (error) {
            // If there was an error, rollback the transaction
            console.log("Transaction failed. Rolling back...");
            await this.cloudDatastore.rollback();
            throw error;
        }
    }
}
exports.UserChatSessionRepository = UserChatSessionRepository;
