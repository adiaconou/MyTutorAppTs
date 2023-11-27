import { Logging } from "@google-cloud/logging";
import { Request, Response } from "express";
import { SecretManager } from "../auth/SecretManager";

const secretManager = new SecretManager();

export class CloudLogController {

    async writeLog(req: Request, res: Response) {
        try {
            const secretName = "gcloud-logging-api-key";
            const keyFileContents = await secretManager.accessSecretVersion(secretName);
            const keyFileJson = JSON.parse(keyFileContents);

            // Initialize the Logging client with the parsed JSON credentials
            const logging = new Logging({
                projectId: "for-fun-153903",
                credentials: keyFileJson,
            });

            const logName = "my-log";
            const log = logging.log(logName);
            const metadata = { resource: { type: "global" } };
            const logMessage = (req.body as LogRequestBody).message;

            const entry = log.entry(metadata, { message: logMessage });

            await log.write(entry);
            res.status(200).send({ message: "Log entry created" });
        } catch (error) {
            console.error(
                "Error accessing logging service account key from Secret Manager: ",
                error
            );
            res.status(500).send({ message: "Error writing log entry", error: error });
        }

    }
}

interface LogRequestBody {
    message: string;
}