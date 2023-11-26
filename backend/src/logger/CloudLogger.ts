import { Request, Response } from 'express';
import { Logging } from '@google-cloud/logging';
import { SecretManager } from '../repository/SecretManager';

class CloudLogger {

  constructor() {
   
  }

  async writeLog(logName: string, message: string): Promise<void> {
    try {
      const secretManager = new SecretManager();
      const secretName = "gcloud-logging-api-key";
      const keyFileContents = await secretManager.accessSecretVersion(secretName);
      const keyFileJson = JSON.parse(keyFileContents);

          // Initialize the Logging client with the parsed JSON credentials
    const logging = new Logging({
        projectId: "for-fun-153903",
        credentials: keyFileJson,
      });

      const log = logging.log(logName);
      const metadata = { resource: { type: "global" } };
      const entry = log.entry(metadata, { message });

      await log.write(entry);
    } catch (error) {
      console.error("Error writing log entry: ", error);
      throw error;
    }
  }

  async logHandler(req: Request, res: Response): Promise<void> {
    try {
      const logName = "my-log";
      const logMessage = (req.body as LogRequestBody).message;

      await this.writeLog(logName, logMessage);
      res.status(200).send({ message: "Log entry created" });
    } catch (error) {
      console.error("Error handling log request: ", error);
      res.status(500).send({ message: "Error writing log entry", error });
    }
  }
}

interface LogRequestBody {
  message: string;
}

export default CloudLogger;