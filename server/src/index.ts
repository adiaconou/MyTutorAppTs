import express, { Request, Response } from "express";
import cors from "cors";
import { GoogleCloudDatastoreDataAccess } from "./dataAccess/googleCloudDatastoreDataAccess";
import { UserSettings } from "./models/settingsModel";

const app = express();
app.use(cors());
app.use(express.json());

const dataAccess = new GoogleCloudDatastoreDataAccess("for-fun-153903");

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

    const updatedUserSettings = await dataAccess.updateUserSettings(
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
