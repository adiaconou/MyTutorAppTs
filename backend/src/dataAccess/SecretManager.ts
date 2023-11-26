import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

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
}