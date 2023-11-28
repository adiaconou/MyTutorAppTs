import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

class SecretManagerServiceClientSingleton {
    private static instance: SecretManagerServiceClient;

    private constructor() { }

    public static getInstance(): SecretManagerServiceClient {
        if (!SecretManagerServiceClientSingleton.instance) {
            SecretManagerServiceClientSingleton.instance = new SecretManagerServiceClient();
        }

        return SecretManagerServiceClientSingleton.instance;
    }
}

export const secretManagerServiceClient = SecretManagerServiceClientSingleton.getInstance();