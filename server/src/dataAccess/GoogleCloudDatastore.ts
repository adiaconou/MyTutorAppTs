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
    return  datastoreEntity as T;
  }
}
