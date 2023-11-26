import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { SecretManager } from '../repository/SecretManager';
import path from 'path';

const envPath = path.resolve(__dirname, "../../.env");

// Load the .env file
dotenv.config({ path: envPath });
const secretManager = new SecretManager();

async function getGoogleClientId(): Promise<string> {
  // Check if the application is running in a production environment
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  if (isProduction) {

    try {
      return await secretManager.accessSecretVersion("google_client_id");

    } catch (error) {
      console.error('Error fetching Google Client ID from Secret Manager:', error);
      throw error; // You may want to handle this error gracefully
    }
  } else {
    // Fetch the Google Client ID from the local .env file during development
    return process.env.GOOGLE_CLIENT_ID || '';
  }
}

async function initializePassport(): Promise<void> {
  const googleClientSecret = "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";
  const googleClientId: string = await getGoogleClientId();

  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: passport.Profile,
        done: (error: any, user?: any) => void
      ) => {
        // Here, you can save the user information to your database.
        // For simplicity, we'll return the user profile.
        return done(null, profile);
      }
    )
  );
  
  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });
}

initializePassport().catch(console.error);