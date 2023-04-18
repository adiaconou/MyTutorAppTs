import { Datastore } from "@google-cloud/datastore";

export class GoogleCloudDatastore<T> {
  private datastore: Datastore;
  private entityType: string;
  private entityKey: string;

  constructor(projectId: string, entityType: string, entityKey: string) {
    this.datastore = new Datastore({ projectId });
    this.entityType = entityType;
    this.entityKey = entityKey;
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
    console.log("GoogleCLoudDataStore get: " + this.entityType + " " + key);
    const datastoreKey = this.datastore.key([this.entityType, key]);
    console.log("A");
    const [datastoreEntity] = await this.datastore.get(datastoreKey);
    if (!datastoreEntity) {
        console.log("IS NULL!");
      return null;
    }
    console.log("B: " + JSON.stringify(datastoreEntity.data));
    return  datastoreEntity as T;
  }
}
