"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatMessagesRepository = void 0;
const GoogleCloudDatastore_1 = require("./GoogleCloudDatastore");
const kind = "UserChatMessage";
class UserChatMessagesRepository {
    cloudDatastore;
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
    async add(id, message) {
        this.cloudDatastore.put(id, message);
    }
    async getMessageIdsForSession(sessionId) {
        const messages = await this.getById(sessionId, 10000); // Adjust limit as needed
        return messages ? messages.map(message => message.id) : [];
    }
}
exports.UserChatMessagesRepository = UserChatMessagesRepository;
