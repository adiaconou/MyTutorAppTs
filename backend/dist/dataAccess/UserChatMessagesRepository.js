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
    async add(id, message) {
        this.cloudDatastore.put(id, message);
    }
}
exports.UserChatMessagesRepository = UserChatMessagesRepository;
