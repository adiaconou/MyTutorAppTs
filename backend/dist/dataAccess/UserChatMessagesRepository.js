"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatMessagesRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
const kind = "UserChatMessage";
class UserChatMessagesRepository {
    constructor(projectId) {
        this.cloudDatastore = new GoogleCloudDatastore_1.GoogleCloudDatastore(projectId, kind);
    }
    async get(userId) {
        return this.cloudDatastore.get(userId);
    }
    async getById(id, limit) {
        let nextPageToken = null;
        const indexName = "chatSessionId";
        const indexValue = id;
        const sortKey = "timestamp";
        let chatMessages = [];
        do {
            const page = await this.cloudDatastore.getPage(limit, nextPageToken, indexName, indexValue, sortKey);
            const entities = page.entities;
            nextPageToken = page.nextPageToken;
            if (entities.length > 0) {
                chatMessages = chatMessages.concat(entities);
            }
        } while (nextPageToken !== null);
        // sort chat sessions by timestamp in ascending order
        // chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return chatMessages;
    }
    async add(id, message) {
        this.cloudDatastore.put(id, message);
    }
}
exports.UserChatMessagesRepository = UserChatMessagesRepository;
