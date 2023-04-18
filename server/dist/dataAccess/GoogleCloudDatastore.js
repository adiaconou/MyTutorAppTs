"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudDatastore = void 0;
const datastore_1 = require("@google-cloud/datastore");
class GoogleCloudDatastore {
    constructor(projectId, entityType) {
        this.datastore = new datastore_1.Datastore({ projectId });
        this.entityType = entityType;
    }
    async put(key, entity) {
        const datastoreKey = this.datastore.key([this.entityType, key]);
        const datastoreEntity = {
            key: datastoreKey,
            data: entity,
        };
        await this.datastore.update(datastoreEntity);
    }
    async get(key) {
        const datastoreKey = this.datastore.key([this.entityType, key]);
        const [datastoreEntity] = await this.datastore.get(datastoreKey);
        if (!datastoreEntity) {
            return null;
        }
        return datastoreEntity;
    }
}
exports.GoogleCloudDatastore = GoogleCloudDatastore;
