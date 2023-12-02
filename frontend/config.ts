
import dotenv from "dotenv";
import path from "path";

// Load the .env file
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Define an interface for the configuration
interface Config {
    openaiApiKey: string;
}

// Validate and load environment variables
const getConfig = (): Config => {
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    return {
        openaiApiKey,
    };
};

const config = getConfig();

export default config;