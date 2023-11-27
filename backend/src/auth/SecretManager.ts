import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import config from '../config';

/* 
This is a helper class for accessing secrets from Google Secret Manager.
*/
export class SecretManager {
  private client: SecretManagerServiceClient;
  private googleProjectId = 'for-fun-153903';

  constructor() {
    this.client = new SecretManagerServiceClient();
  }

  async accessSecretVersion(secretName: string): Promise<string> {
    const name = `projects/${this.googleProjectId}/secrets/${secretName}/versions/latest`;
    console.log("Getting secret " + name);
    const [version] = await this.client.accessSecretVersion({ name });

    if (!version.payload || !version.payload.data) {
      throw new Error(`Unable to access secret: ${secretName}`);
    }

    const secretValue = version.payload.data.toString();
    console.log("Secret value: " + secretValue);
    return secretValue;
  }

  async getExpressUserSessionSecret(): Promise<string> {
    // Check if the application is running in a production environment
    if (config.isProduction) {

      try {
        return await this.accessSecretVersion("express_user_session_secret");

      } catch (error) {
        console.error('Error fetching express_user_session_secret from Secret Manager:', error);
        throw error; // You may want to handle this error gracefully
      }
    } else {
      // Fetch the Google Client ID from the local .env file during development
      return config.expressUserSessionSecret;
    }
  }

  async getJwtSecret(): Promise<string> {
    // Check if the application is running in a production environment
    if (config.isProduction) {

      try {
        return await this.accessSecretVersion("jwt_secret");

      } catch (error) {
        console.error('Error fetching express_user_session_secret from Secret Manager:', error);
        throw error; // You may want to handle this error gracefully
      }
    } else {
      // Fetch the Google Client ID from the local .env file during development
      return config.jwtSecret;
    }
  }
}