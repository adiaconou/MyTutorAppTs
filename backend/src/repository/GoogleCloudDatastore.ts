import { Datastore, Entity, Key, Transaction } from "@google-cloud/datastore";
import { v4 as uuidv4 } from "uuid";


export class GoogleCloudDatastore<T> {
  private datastore: Datastore;
  private entityType: string;
  private currentTransaction: Transaction | null = null;

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
    await this.datastore.upsert(datastoreEntity);
  }

  async transactionalPut(
    kindA: string,
    keyA: string,
    entityA: object,
    kindB: string,
    keyB: string,
    entityB: object
  ): Promise<void> {
    // Define keys for both kinds
    const datastoreKeyA: Key = this.datastore.key([kindA, keyA]);
    const datastoreKeyB: Key = this.datastore.key([kindB, keyB]);

    // Define datastore entities for both kinds
    const datastoreEntityA: Entity = {
      key: datastoreKeyA,
      data: entityA,
    };
    const datastoreEntityB: Entity = {
      key: datastoreKeyB,
      data: entityB,
    };

    // Initialize a transaction
    const transaction = this.datastore.transaction();

    try {
      // Start the transaction
      await transaction.run();

      // Perform update operations for both kinds within the transaction
      transaction.save(datastoreEntityA);
      transaction.save(datastoreEntityB);

      // Commit the transaction (apply the changes)
      await transaction.commit();
    } catch (error) {
      // Handle errors (e.g., rollback the transaction)
      await transaction.rollback();
      console.error("Error performing transactional update:", error);
      // Propagate the error to the caller (optional, based on your error handling strategy)
      throw error;
    }
  }

  async transactionalPutArray(
    kindA: string,
    keyA: string,
    entityA: object,
    kindB: string,
    entitiesB: object[]
  ): Promise<void> {
    const datastoreKeyA: Key = this.datastore.key([kindA, keyA]);
  
  // Define datastore entity for kindA
  const datastoreEntityA: Entity = {
    key: datastoreKeyA,
    data: entityA,
  };

  // Initialize a transaction
  const transaction = this.datastore.transaction();

  try {
    // Start the transaction
    await transaction.run();

    // Perform update operation for kindA within the transaction
    transaction.save(datastoreEntityA);

    // Iterate over kindB entities and save each
    for (const entityB of entitiesB) {
      const keyB = uuidv4(); // Assuming each entityB has an 'id' property
      const datastoreKeyB: Key = this.datastore.key([kindB, keyB]);

      const datastoreEntityB: Entity = {
        key: datastoreKeyB,
        data: entityB,
      };

      transaction.save(datastoreEntityB);
    }

    // Commit the transaction (apply the changes)
    await transaction.commit();
  } catch (error) {
    // Handle errors (e.g., rollback the transaction)
    await transaction.rollback();
    console.error("Error performing transactional update:", error);
    // Propagate the error to the caller (optional, based on your error handling strategy)
    throw error;
  }
  }

  async get(key: string): Promise<T | null> {
    const datastoreKey = this.datastore.key([this.entityType, key]);
    const [datastoreEntity] = await this.datastore.get(datastoreKey);
    if (!datastoreEntity) {
      return null;
    }
    return datastoreEntity as T;
  }

  async getPage(
    limit: number,
    nextPageToken: string | null,
    indexName: string,
    indexValue: string,
    sortKey: string
  ): Promise<{ entities: T[]; nextPageToken: string | null }> {
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
      let nextNextPageToken: string | null = null;
      if (moreResults !== Datastore.NO_MORE_RESULTS && nextPageCursor) {
        nextNextPageToken = nextPageCursor;
      }
      return {
        entities: entities as T[],
        nextPageToken: nextNextPageToken,
      };
    } catch (error) {
      // Log the error details for debugging purposes
      console.error("Error executing query:", error);
      // Propagate the error to the caller (optional, based on your error handling strategy)
      throw error;
    }
  }

  async beginTransaction() {
    this.currentTransaction = this.datastore.transaction();
    await this.currentTransaction.run();
  }

  async commit() {
    if (!this.currentTransaction) {
      throw new Error("No transaction in progress");
    }
    await this.currentTransaction.commit();
    this.currentTransaction = null;
  }

  async rollback() {
    if (!this.currentTransaction) {
      throw new Error("No transaction in progress");
    }
    await this.currentTransaction.rollback();
    this.currentTransaction = null;
  }

  async transactionalDelete(keys: string[]): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error("No transaction in progress");
    }
    const datastoreKeys = keys.map(key => this.datastore.key([this.entityType, key]));
    this.currentTransaction.delete(datastoreKeys);
  }
}
