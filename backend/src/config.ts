
import dotenv from "dotenv";
import path from "path";

// Load the .env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Define an interface for the configuration
interface Config {
    port: number;
    frontendUrl: string;
    backendUrl: string;
    isProduction: boolean;
    googleClientId: string;
    jwtSecret: string;
    expressUserSessionSecret: string;
}

// Validate and load environment variables
const getConfig = (): Config => {
    const port = parseInt(process.env.PORT || "3001");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    const isProduction = process.env.NODE_ENV === 'production';
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const jwtSecret = process.env.JWT_SECRET || '';
    const expressUserSessionSecret = process.env.EXPRESS_USER_SESSION_SECRET || '';
    
    return {
        port,
        frontendUrl,
        isProduction,
        googleClientId,
        backendUrl,
        jwtSecret,
        expressUserSessionSecret,
    };
};

const config = getConfig();

export default config;