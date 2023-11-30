import { Logging } from "@google-cloud/logging";
import { Request, Response } from "express";
import { SecretManager } from "../auth/SecretManager";
import config from "../config";

/*
    Handle HTTP requests for logging messages to google's Cloud Logger
*/
export class CloudLogController {
    private secretManager: SecretManager;

    constructor(secretManager: SecretManager) {
        this.secretManager = secretManager;
    }

    async writeLog(req: Request, res: Response) {
        // Get the cloud logging credentials from Secret Manager
        const secretName = "gcloud-logging-api-key";
        const keyFileContents = await this.secretManager.accessSecretVersion(secretName);
        const keyFileJson = JSON.parse(keyFileContents);

        console.log("keyFileJson: " + keyFileJson);
        
        // Initialize the Logging client with the parsed JSON credentials
        const logging = new Logging({
            projectId: config.googleProjectId,
            credentials: keyFileJson,
        });

        const logName = "my-log";
        const log = logging.log(logName);
        const metadata = { resource: { type: "global" } };
        const logMessage = (req.body as LogRequestBody).message;

        // Creates an entry, but doesn't send API request
        const entry = log.entry(metadata, { message: logMessage });

        try {
            // Send HTTP log request
            await log.write(entry);
            res.status(200).send({ message: "Log entry created" });
        } catch (error) {
            console.error(
                "Error accessing logging service account key from Secret Manager",
                error
            );
            res.status(500).send({ message: "Error writing log entry", error: error });
        }
    }
}

interface LogRequestBody {
    message: string;
}