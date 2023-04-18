import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export class SecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.client = new SecretManagerServiceClient();
  }

  async accessSecretVersion(secretName: string): Promise<string> {
    console.log("Getting secret...");
    const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await this.client.accessSecretVersion({ name });

    if (!version.payload || !version.payload.data) {
      throw new Error(`Unable to access secret: ${secretName}`);
    }

    const secretValue = version.payload.data.toString();

    console.log("Secret value: " + secretValue);
    return secretValue;
  }
}
