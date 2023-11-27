import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { SecretManager } from './SecretManager';
import config from '../config';

const secretManager = new SecretManager();

async function getGoogleClientId(): Promise<string> {

  if (config.isProduction) {

    try {
      return await secretManager.accessSecretVersion("google_client_id");

    } catch (error) {
      console.error('Error fetching Google Client ID from Secret Manager:', error);
      throw error; // You may want to handle this error gracefully
    }
  } else {
    // Fetch the Google Client ID from the local .env file during development
    return config.googleClientId;
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
        callbackURL: `${config.backendUrl}/auth/google/callback`,
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