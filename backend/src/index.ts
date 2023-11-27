import express from "express";
import cors from "cors";
import { SecretManager } from "./auth/SecretManager";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import "./auth/PassportSetup";
import path from "path";
import cookieParser from 'cookie-parser';
import routes from './routes';  
import config from "./config";

const secretManager = new SecretManager();
const app = express();

// Async function to initialize the app
async function initializeApp() {
  
  // Enable CORS for your frontend
  app.use(cors({ 
    origin: config.frontendUrl, 
    credentials: true 
  }));

  // Other middleware setup
  app.use(express.json());
  app.use(cookieParser());

  const sessionSecret = await secretManager.getExpressUserSessionSecret();
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

  app.listen(config.port, () => {
    console.log(`Backend server listening on port ${config.port}`);
  });
}

// Call the async function to start the app
initializeApp().catch(console.error);
