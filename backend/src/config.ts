
import dotenv from "dotenv";
import path from "path";

// Load the .env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Define an interface for the configuration
interface Config {
    port: number;
    frontendUrl: string;
    isProduction: boolean;
}

// Validate and load environment variables
const getConfig = (): Config => {
    const port = parseInt(process.env.PORT || "3001");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        port,
        frontendUrl,
        isProduction,
    };
};

const config = getConfig();

export default config;