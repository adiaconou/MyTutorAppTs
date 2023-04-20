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
        await this.datastore.upsert(datastoreEntity);
    }
    async get(key) {
        const datastoreKey = this.datastore.key([this.entityType, key]);
        const [datastoreEntity] = await this.datastore.get(datastoreKey);
        if (!datastoreEntity) {
            return null;
        }
        return datastoreEntity;
    }
    async getPage(limit, nextPageToken, indexName, indexValue, sortKey) {
        const query = this.datastore
            .createQuery(this.entityType)
            .filter(indexName, "=", indexValue)
            .order(sortKey, { descending: true })
            .limit(limit);
        if (nextPageToken) {
            query.start(nextPageToken);
        }
        try {
            const [entities, info] = await this.datastore.runQuery(query);
            const nextPageCursor = info.endCursor;
            const moreResults = info.moreResults;
            let nextNextPageToken = null;
            if (moreResults !== datastore_1.Datastore.NO_MORE_RESULTS && nextPageCursor) {
                nextNextPageToken = nextPageCursor;
            }
            return {
                entities: entities,
                nextPageToken: nextNextPageToken,
            };
        }
        catch (error) {
            // Log the error details for debugging purposes
            console.error("Error executing query:", error);
            // Propagate the error to the caller (optional, based on your error handling strategy)
            throw error;
        }
    }
}
exports.GoogleCloudDatastore = GoogleCloudDatastore;
