"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudDatastore = void 0;
const datastore_1 = require("@google-cloud/datastore");
class GoogleCloudDatastore {
    constructor(projectId, entityType, entityKey) {
        this.datastore = new datastore_1.Datastore({ projectId });
        this.entityType = entityType;
        this.entityKey = entityKey;
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
        console.log("GoogleCLoudDataStore get: " + this.entityType + " " + key);
        const datastoreKey = this.datastore.key([this.entityType, key]);
        console.log("A");
        const [datastoreEntity] = await this.datastore.get(datastoreKey);
        if (!datastoreEntity) {
            console.log("IS NULL!");
            return null;
        }
        console.log("B: " + JSON.stringify(datastoreEntity.data));
        return datastoreEntity;
    }
}
exports.GoogleCloudDatastore = GoogleCloudDatastore;
