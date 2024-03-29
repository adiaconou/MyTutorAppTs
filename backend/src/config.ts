
import dotenv from "dotenv";
import path from "path";

// Load the .env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Define an interface for the configuration
interface Config {
    port: number;
    googleProjectId: string;
    frontendUrl: string;
    backendUrl: string;
    isProduction: boolean;
    googleClientId: string;
    jwtSecret: string;
    expressUserSessionSecret: string;
    openaiApiKey: string;
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
    const googleProjectId = 'for-fun-153903';
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    return {
        port,
        googleProjectId,
        frontendUrl,
        isProduction,
        googleClientId,
        backendUrl,
        jwtSecret,
        expressUserSessionSecret,
        openaiApiKey,
    };
};

const config = getConfig();

export default config;