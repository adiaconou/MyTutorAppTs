"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretManager = void 0;
const secret_manager_1 = require("@google-cloud/secret-manager");
/*
This is a helper class for accessing secrets from Google Secret Manager.
*/
class SecretManager {
    constructor() {
        this.googleProjectId = 'for-fun-153903';
        this.client = new secret_manager_1.SecretManagerServiceClient();
    }
    async accessSecretVersion(secretName) {
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
exports.SecretManager = SecretManager;
