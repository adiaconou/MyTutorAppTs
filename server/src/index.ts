import express, { Request, Response } from "express";
import cors from "cors";
import { GoogleCloudDatastoreDataAccess } from "./dataAccess/googleCloudDatastoreDataAccess";
import { UserSettings } from "./models/settingsModel";
import { Logging } from "@google-cloud/logging";
import { GoogleCloudDatastore } from "./dataAccess/GoogleCloudDatastore";
import { UserSettingsRepository } from "./dataAccess/UserSettingsRepository";

const app = express();
app.use(cors());
app.use(express.json());

// const dataAccess = new GoogleCloudDatastoreDataAccess("for-fun-153903");
const dataAccess = new UserSettingsRepository('for-fun-153903');

/***** LOGGING  *********/
interface LogRequestBody {
  message: string;
}

const serviceAccountKeyLoggingPath = process.env.SERVICE_ACCOUNT_KEY_LOGGING;
const fs = require("fs");

app.post("/log", async (req: Request, res: Response) => {
  console.log("a");
  if (serviceAccountKeyLoggingPath) {
    // Read the contents of the JSON key file
    const keyFileContents = fs.readFileSync(
      serviceAccountKeyLoggingPath,
      "utf8"
    );

    // Parse the contents as JSON
    const keyFileJson = JSON.parse(keyFileContents);

    // Initialize the Logging client with the parsed JSON credentials
    const logging = new Logging({
      projectId: "for-fun-153903",
      credentials: keyFileJson,
    });

    console.log("I'm here");
    const logName = "my-log";
    const log = logging.log(logName);
    const metadata = { resource: { type: "global" } };
    const logMessage = (req.body as LogRequestBody).message;

    const entry = log.entry(metadata, { message: logMessage });

    try {
      await log.write(entry);
      res.status(200).send({ message: "Log entry created" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error writing log entry", error: error });
    }

    // Use the 'logging' instance as needed
  } else {
    console.error(
      "The SERVICE_ACCOUNT_KEY_LOGGING environment variable is not defined or is empty."
    );
  }
});

/****************************************** */

app.get("/user-settings/:userId", async (req: Request, res: Response) => {
  try {
    console.log("HI");
    const userId = req.params.userId;
    console.log("userId: " + userId);
    const userSettings = await dataAccess.getUserSettings(userId);
    console.log("user settings are: " + JSON.stringify(userSettings));
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
    console.log(updatedUserSettings);
  } catch (error) {
    res.status(500).json({ message: "Error updating user settings" });
  }
});

app.listen(3001, () => {
  console.log("Backend server listening on port 3001");
});
