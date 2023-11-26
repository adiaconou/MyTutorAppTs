import express, { Request, Response } from "express";
import cors from "cors";
import { Logging } from "@google-cloud/logging";
import { UserChatMessagesRepository } from "./dataAccess/UserChatMessagesRepository";
import { SecretManager } from "./dataAccess/SecretManager";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import "./auth/PassportSetup";
import path from "path";
import cookieParser from 'cookie-parser';
import routes from './routes';  

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const secretManager = new SecretManager();
const app = express();
// Async function to initialize the app
async function initializeApp() {
  
  // Load the .env file
  const envPath = path.resolve(__dirname, "../.env");
  dotenv.config({ path: envPath });

  // Enable CORS for your frontend
  app.use(cors({ 
    origin: process.env.FRONTEND_URL, 
    credentials: true 
  }));

  // Other middleware setup
  app.use(express.json());
  app.use(cookieParser());

  const sessionSecret = await getExpressUserSessionSecret();
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000, secure: 'auto' },
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(routes); 
  // ... rest of your Express app setup ...
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}

// Call the async function to start the app
initializeApp().catch(console.error);

/********************/

async function getExpressUserSessionSecret(): Promise<string> {
  // Check if the application is running in a production environment
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  if (isProduction) {

    try {
      return await secretManager.accessSecretVersion("express_user_session_secret");

    } catch (error) {
      console.error('Error fetching express_user_session_secret from Secret Manager:', error);
      throw error; // You may want to handle this error gracefully
    }
  } else {
    // Fetch the Google Client ID from the local .env file during development
    return process.env.EXPRESS_USER_SESSION_SECRET || '';
  }
}

/***** LOGGING  *********/
interface LogRequestBody {
  message: string;
}

/*** Google Auth Routes ***/

app.post("/log", async (req: Request, res: Response) => {
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
});

/****************************************** */
