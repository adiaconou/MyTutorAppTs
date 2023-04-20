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
    async get(id) {
        return this.cloudDatastore.get(id);
    }
    async getByUserId(userId) {
        const limit = 10;
        let nextPageToken = null;
        const indexName = "userId";
        const indexValue = userId;
        const sortKey = "createdAt";
        let chatSessions = [];
        do {
            const page = await this.cloudDatastore.getPage(limit, nextPageToken, indexName, indexValue, sortKey);
            const entities = page.entities;
            nextPageToken = page.nextPageToken;
            if (entities.length > 0) {
                chatSessions = chatSessions.concat(entities);
            }
        } while (nextPageToken !== null);
        // sort chat sessions by createdAt in ascending order
        chatSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return chatSessions;
    }
}
exports.UserChatSessionRepository = UserChatSessionRepository;
