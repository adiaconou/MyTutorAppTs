"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatSessionRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
const kind = "UserChatSession";
class UserChatSessionRepository {
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
}
exports.UserChatSessionRepository = UserChatSessionRepository;
