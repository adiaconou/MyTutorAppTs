
// Define an interface for the configuration
interface Config {
    languages: Record<string, string>;
}

// Validate and load environment variables
const getConfig = (): Config => {
    
    const languages: Record<string, string> = {
        English: 'en',
        Spanish: 'es',
        French: 'fr',
        German: 'de',
        Italian: 'it',
        Portuguese: 'pt',
        Dutch: 'nl',
        Russian: 'ru',
        Chinese: 'zh',
        Japanese: 'ja',
        Greek: 'el',
        Latvian: 'lv',
    };
    
    return {
        languages,
    };
};

const config = getConfig();

export default config;
