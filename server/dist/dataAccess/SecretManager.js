"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretManager = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
class SecretManager {
    constructor(projectId) {
        this.projectId = projectId;
        this.client = new secret_manager_1.SecretManagerServiceClient();
    }
    async accessSecretVersion(secretName) {
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
exports.SecretManager = SecretManager;
