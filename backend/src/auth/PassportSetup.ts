import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import path from 'path';

const envPath = path.resolve(__dirname, "../../.env");

// Load the .env file
dotenv.config({ path: envPath });
const client = new SecretManagerServiceClient();

async function getSecret(secretName: string): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env.GOOGLE_PROJECT_ID}/secrets/${secretName}/versions/latest`,
  });

  // payload.data is of type Buffer, so toString can be safely called
  if (version.payload && version.payload.data) {
    // payload.data is of type Buffer, so toString can be safely called
    return version.payload.data.toString();
  } else {
    throw new Error('Payload or payload data is null or undefined.');
  }
}

async function initializePassport(): Promise<void> {
  // const googleClientSecret = await getSecret('gcloud_oauth_client_secret');
  const googleClientSecret = "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";
  console.log("googleClientSecret: " + googleClientSecret);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
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