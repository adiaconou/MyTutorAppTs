import { Datastore, Entity, Key, Transaction } from "@google-cloud/datastore";
import { v4 as uuidv4 } from "uuid";
import NotFoundError from "../error/NotFoundError";
import PermissionError from "../error/PermissionError";
import AuthenticationError from "../error/AuthenticationError";
import InvalidArgumentError from "../error/InvalidArgumentError";
import InternalError from "../error/InternalError";
import ServiceUnavailableError from "../error/ServiceUnavailableError";
import BaseError from "../error/BaseError";
import ResourceExhaustedError from "../error/ResourceExhaustedError";

// https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
type DatastoreError = {
  error: {
    statusCode: number;
    message: string;
    status: string;
  }
};

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
    try {
      await this.datastore.upsert(datastoreEntity);
    } catch (error) {
      throw this.getError(error as DatastoreError);
    }
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

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw this.getError(error as DatastoreError);
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

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw this.getError(error as DatastoreError);
    }
  }

  async get(key: string): Promise<T | null> {
    const datastoreKey = this.datastore.key([this.entityType, key]);
    try {
      const [datastoreEntity] = await this.datastore.get(datastoreKey);

      // The Datastore client returns a null entity if it doesn't exist in the datastore.
      if (!datastoreEntity) {
        throw new NotFoundError(`Entity not found for entityType=${this.entityType}, key=${key}`);
      }

      return datastoreEntity as T;
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      } else {
        throw this.getError(error as DatastoreError);
      }
    }
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
      throw this.getError(error as DatastoreError);
    }
  }

  async beginTransaction() {
    this.currentTransaction = this.datastore.transaction();
    await this.currentTransaction.run();
  }

  async commit() {
    if (!this.currentTransaction) {
      throw new BaseError("No transaction in progress");
    }
    await this.currentTransaction.commit();
    this.currentTransaction = null;
  }

  async rollback() {
    if (!this.currentTransaction) {
      throw new BaseError("No transaction in progress");
    }
    await this.currentTransaction.rollback();
    this.currentTransaction = null;
  }

  async transactionalDelete(keys: string[]): Promise<void> {
    if (!this.currentTransaction) {
      throw new BaseError("No transaction in progress");
    }
    const datastoreKeys = keys.map(key => this.datastore.key([this.entityType, key]));
    this.currentTransaction.delete(datastoreKeys);
  }

  // Wrap Datastore errors into internal exceptions.
  private getError(error: DatastoreError): BaseError {
    console.log({ error });

    // Datastore client status codes defined here: 
    // https://github.com/googleapis/googleapis/blob/master/google/rpc/code.proto
    const status = error.error.status;
    const code = error.error.statusCode;
    const message = error.error.message;

    switch (status) {
      case "INTERNAL":
        return new InternalError(message);
      case "INVALID_ARGUMENT":
        return new InvalidArgumentError(message);
      case "NOT_FOUND":
        return new NotFoundError(message);
      case "PERMISSION_DENIED":
        return new PermissionError(message);
      case "UNAUTHENTICATED":
        return new AuthenticationError(message);
      case "RESOURCE_EXHAUSTED":
        return new ResourceExhaustedError(message);
      case "UNAVAILABLE":
        return new ServiceUnavailableError(message);
      default:
        return new BaseError(message, code);
    }
  }
}
