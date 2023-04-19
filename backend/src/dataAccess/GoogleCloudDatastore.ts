import { Datastore } from "@google-cloud/datastore";

export class GoogleCloudDatastore<T> {
  private datastore: Datastore;
  private entityType: string;

  constructor(projectId: string, entityType: string) {
    this.datastore = new Datastore({ projectId });
    this.entityType = entityType;
  }

  async put(key: string, entity: T): Promise<void> {
    const datastoreKey = this.datastore.key([this.entityType, key]);
    const datastoreEntity = {
      key: datastoreKey,
      data: entity,
    };
    await this.datastore.update(datastoreEntity);
  }

  async get(key: string): Promise<T | null> {
    const datastoreKey = this.datastore.key([this.entityType, key]);
    const [datastoreEntity] = await this.datastore.get(datastoreKey);
    if (!datastoreEntity) {
      return null;
    }
    return datastoreEntity as T;
  }

  async getPage(limit: number, nextPageToken: string | null, indexName: string, indexValue: string, sortKey: string): Promise<{ entities: T[], nextPageToken: string | null }> {
    const query = this.datastore
      .createQuery(this.entityType)
      .filter(indexName, '=', indexValue)
      .order(sortKey, { descending: true })
      .limit(limit);
  
    if (nextPageToken) {
      query.start(nextPageToken);
    }
  
    const [entities, info] = await this.datastore.runQuery(query);
    const nextPageCursor = info.endCursor;
    const moreResults = info.moreResults;
  
    let nextNextPageToken: string | null = null;
    if (moreResults !== Datastore.NO_MORE_RESULTS && nextPageCursor) {
      nextNextPageToken = nextPageCursor;
    }
  
    return {
      entities: entities as T[],
      nextPageToken: nextNextPageToken,
    };
  }
}
