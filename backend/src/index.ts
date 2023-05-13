import express, { Request, Response } from "express";
import cors from "cors";
import { UserSettings } from "./models/UserSettings";
import { Logging } from "@google-cloud/logging";
import { UserSettingsRepository } from "./dataAccess/UserSettingsRepository";
import { UserChatSessionRepository } from "./dataAccess/UserChatSessionRepository";
import { UserChatMessagesRepository } from "./dataAccess/UserChatMessagesRepository";
import { SecretManager } from "./dataAccess/SecretManager";
import { UserChatSession } from "./models/UserChatSession";
import { UserChatMessage } from "./models/UserChatMessage";
import { isAuthenticated } from "./auth/AuthMiddleware";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import "./auth/PassportSetup";
import path from "path";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

interface GoogleUser {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{value: string, verified: boolean}>;
  photos: Array<{value: string}>;
  provider: string;
  _raw: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
  };
}

const envPath = path.resolve(__dirname, "../.env");

// Load the .env file
dotenv.config({ path: envPath });

const JWT_SECRET = process.env.JWT_SECRET || "NO_SECRET_FOUND";

// Log the SESSION_SECRET
console.log("SESSION_SECRET: ", process.env.SESSION_SECRET);
console.log("PROJECT ID: ", process.env.GOOGLE_PROJECT_ID);

const app = express();
app.use(express.json());
app.use(cookieParser());

// Enable CORS for your frontend
console.log("FRONTEND URL: " + process.env.FRONTEND_URL);
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

/*** Auth setup ***/
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: 'auto' }, // 1 day
  })
);
app.use(passport.initialize());
app.use(passport.session());
/********************/

const userSettingsRepo = new UserSettingsRepository("for-fun-153903");
const userChatSessionRepo = new UserChatSessionRepository("for-fun-153903");
const userMessageRepo = new UserChatMessagesRepository("for-fun-153903");

const secretManager = new SecretManager("for-fun-153903");

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/***** LOGGING  *********/
interface LogRequestBody {
  message: string;
}

/*** Google Auth Routes ***/
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    successRedirect: "/auth/google/callback",
    failureRedirect: "/login", // Replace with your failure redirect URL
    prompt: "consent"
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    const user: GoogleUser = req.user as GoogleUser;
    console.log("User req: " + JSON.stringify(user));
    console.log("JWT SECRET: " + JWT_SECRET);

    const { id, displayName, emails } = req.user as GoogleUser;
    const token = jwt.sign(
      {
        userID: id,
        displayName,
        email: emails && emails.length > 0 ? emails[0].value : null,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("DISPLAY NAME: " + displayName);
    console.log("userId: " + user.id + " token!!: " + token);
    // Set the JWT in a secure HTTP-only cookie
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });

    res.redirect(FRONTEND_URL);
  }
);

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.get('/auth/status', (req: Request, res: Response) => {
  // Get the JWT from the cookie
  const token = req.cookies.token;

  // If the token exists
  if (token) {
    // Verify the token
    console.log("WE have a token!");
    jwt.verify(token, JWT_SECRET, (err: jwt.JsonWebTokenError | null, decodedToken: any) => {
      if (err) {
        // Token verification failed
        console.log("Token verification failed");
        res.json({ authenticated: false });
      } else {
        // Token is valid, user is authenticated
        // You can also send back any other user data stored in the token
        console.log("LET'S GOOO AUTH");
        const { userID, displayName, email } = decodedToken as { userID: string, displayName: string, email: string };
        res.json({ authenticated: true, userID, displayName, email });
      }
    });
  } else {
    // No token, user is not authenticated
    console.log("FALSE BITCHES");
    res.json({ authenticated: false });
  }
});

app.post('/auth/logout', (req, res) => {
  // Get the token from the cookie
  const token = req.cookies.token;

  // Clear the token cookie
  res.clearCookie('token');

  res.json({ message: 'Logged out' });
});

app.post("/log", async (req: Request, res: Response) => {
  try {
    const secretName = "gcloud-logging-api-key"; // Replace with the name of the secret containing the logging service account key
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

app.get("/userSettings/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const userSettings = await userSettingsRepo.getUserSettings(userId);
    res.json(userSettings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user settings" });
  }
});

app.put("/userSettings/:userId", async (req: Request, res: Response) => {
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

    const updatedUserSettings = await userSettingsRepo.updateUserSettings(
      userId,
      userSettings
    );
    res.json(updatedUserSettings);
  } catch (error) {
    res.status(500).json({ message: `Error updating user settings ${error}` });
  }
});

app.put("/messages/:id", async (req: Request, res: Response) => {
  try {
    const id = req.body.id;
    const chatSessionId = req.body.chatSessionId;
    const text = req.body.text;
    const timestamp = req.body.timestamp;
    const sender = req.body.sender;

    const newMessage: UserChatMessage = {
      id,
      chatSessionId,
      text,
      timestamp,
      sender,
    };

    const updatedUserSettings = await userMessageRepo.add(id, newMessage);
    res.json(updatedUserSettings);
  } catch (error) {
    res.status(500).json({ message: "Error adding new message" });
  }
});

app.get("/chatSessions/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const session = await userChatSessionRepo.get(id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat session" });
  }
});

app.get("/messages/", async (req: Request, res: Response) => {
  try {
    // Access query parameters using req.query
    const chatSessionId = req.query.chatSessionId as string;
    const limitStr = req.query.limit as string;

    // Validate query parameters
    if (!chatSessionId || !limitStr) {
      return res.status(400).json({ message: "Missing userId or limit" });
    }

    // Convert limit to an integer
    const limit = parseInt(limitStr, 10);

    // Check if limit is a valid number
    if (isNaN(limit)) {
      return res.status(400).json({ message: "Invalid limit" });
    }

    const session = await userMessageRepo.getById(chatSessionId, limit);

    res.json(session);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chat session list " + error });
  }
});

app.get("/chatSessions/", async (req: Request, res: Response) => {
  try {
    // Access query parameters using req.query
    const userId = req.query.userId as string;
    const limitStr = req.query.limit as string;

    // Validate query parameters
    if (!userId || !limitStr) {
      return res.status(400).json({ message: "Missing userId or limit" });
    }

    // Convert limit to an integer
    const limit = parseInt(limitStr, 10);

    // Check if limit is a valid number
    if (isNaN(limit)) {
      return res.status(400).json({ message: "Invalid limit" });
    }

    console.log("LIMIT: " + limit);
    const session = await userChatSessionRepo.getByUserId(userId, limit, 1);

    res.json(session);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching chat session list " + error });
  }
});

app.put("/chatSessions/:id", async (req: Request, res: Response) => {
  try {
    // Extract 'session' and 'initialMessage' from the request body
    const { session, initialMessage } = req.body;

    // Validate and destructure the 'session' object
    if (!session) {
      return res
        .status(400)
        .json({ message: "Missing session object in request body" });
    }
    const { userId, id, createdAt, lastUpdatedAt, summary } =
      session as UserChatSession;

    // Create the session object to be stored in the repository
    const sessionToCreate: UserChatSession = {
      userId,
      id,
      createdAt: new Date(createdAt),
      lastUpdatedAt: new Date(lastUpdatedAt),
      summary,
    };

    // Validate and destructure the 'initialMessage' object (if needed)
    if (initialMessage) {
      const {
        id: messageId,
        chatSessionId,
        text,
        timestamp,
        sender,
      } = initialMessage as UserChatMessage;

      // Create the initialMessage object to be stored in the repository (if needed)
      const messageToCreate: UserChatMessage = {
        id: messageId,
        chatSessionId,
        text,
        timestamp: new Date(timestamp),
        sender,
      };

      await userChatSessionRepo.createNew(
        sessionToCreate.id,
        sessionToCreate,
        initialMessage.id,
        initialMessage
      );
    } else {
      await userChatSessionRepo.create(id, session);
    }

    res.status(204).send();
  } catch (error) {
    console.log("Error creating chat session: " + error);
    res.status(500).json({ message: "Error creating chat session" });
  }
});

app.listen(PORT, () => {
  console.log("Backend server listening on port 3001");
});
