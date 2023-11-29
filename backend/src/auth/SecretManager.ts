import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import config from '../config';
import { secretManagerServiceClient } from "./SecretManagerServiceClientSingleton";

/* 
This is a helper class for accessing secrets used for API access.
*/
export class SecretManager {
  private client: SecretManagerServiceClient;

  constructor(client: SecretManagerServiceClient = secretManagerServiceClient) {
    this.client = client;
  }

  /*
    This method retrieves the latest version of secretName from the Google Cloud Secret Manager
  */
  async accessSecretVersion(secretName: string): Promise<string> {
    const name = `projects/${config.googleProjectId}/secrets/${secretName}/versions/latest`;
    console.log("Getting secret " + name);
    const [version] = await this.client.accessSecretVersion({ name });

    if (!version.payload || !version.payload.data) {
      throw new Error(`Unable to access secret ${secretName}`);
    }

    const secretValue = version.payload.data.toString();
    console.log(`Successfully retrieved secret ${secretName}`);
    return secretValue;
  }

  /*
    This method retrieves the express_user_session_secret secret from the cloud
    if running in prod, otherwise from the environment if running locally.
  */
  async getExpressUserSessionSecret(): Promise<string> {
    // Check if the application is running in a production environment.
    // Retrieve secret from cloud if yes.
    if (config.isProduction) {
      try {
        return await this.accessSecretVersion("express_user_session_secret");

      } catch (error) {
        console.error('Error fetching express_user_session_secret from Secret Manager', error);
        throw error;
      }
    } else {
      // Fetch the Google Client ID from the local .env file during local development
      return config.expressUserSessionSecret;
    }
  }

  /*
    This method retrieves the jwt_secret secret from the cloud
    if running in prod, otherwise from the environment if running locally.
  */
  async getJwtSecret(): Promise<string> {
    // Check if the application is running in a production environment.
    // Retrieve secret from cloud if yes.
    if (config.isProduction) {
      try {
        return await this.accessSecretVersion("jwt_secret");

      } catch (error) {
        console.error('Error fetching jwt_secret from Secret Manager', error);
        throw error;
      }
    } else {
      // Fetch the Google Client ID from the local .env file during local development
      return config.jwtSecret;
    }
  }
}