import express, { Request, Response } from "express";
import cors from "cors";
import { UserSettings } from "./models/settingsModel";
import { Logging } from "@google-cloud/logging";
import { UserSettingsRepository } from "./dataAccess/UserSettingsRepository";
import { SecretManager } from "./dataAccess/SecretManager";

const app = express();
app.use(cors());
app.use(express.json());

const dataAccess = new UserSettingsRepository('for-fun-153903');
const secretManager = new SecretManager('for-fun-153903');

const PORT = process.env.PORT || 3001;

/***** LOGGING  *********/
interface LogRequestBody {
  message: string;
}

const serviceAccountKeyLoggingPath = process.env.SERVICE_ACCOUNT_KEY_LOGGING;
const fs = require("fs");

app.post("/log", async (req: Request, res: Response) => {
  console.log("a");
  
  try {
    const secretName = 'gcloud-logging-api-key'; // Replace with the name of the secret containing the logging service account key
    const keyFileContents = await secretManager.accessSecretVersion(secretName);
    const keyFileJson = JSON.parse(keyFileContents);

    // Initialize the Logging client with the parsed JSON credentials
    const logging = new Logging({
      projectId: 'for-fun-153903',
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
    console.error("Error accessing logging service account key from Secret Manager: ", error);
    res.status(500).send({ message: "Error writing log entry", error: error });
  }
});

/****************************************** */

app.get("/user-settings/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const userSettings = await dataAccess.getUserSettings(userId);
    res.json(userSettings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user settings" });
  }
});

app.put("/user-settings/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const settings = req.body.settings;

    if (!settings) {
      res.status(400).json({ message: "Invalid request data" });
      return;
    }

    const userSettings: UserSettings = {
      userId,
      settings,
    };

    const updatedUserSettings = await dataAccess.updateUserSettings(userId,
      userSettings
    );
    res.json(updatedUserSettings);
  } catch (error) {
    res.status(500).json({ message: "Error updating user settings" });
  }
});

app.listen(PORT, () => {
  console.log("Backend server listening on port 3001");
});
