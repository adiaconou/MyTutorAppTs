
// Define an interface for the configuration
interface Config {
    languages: Record<string, string>;
}

// Validate and load environment variables
const getConfig = (): Config => {
    
    const languages: Record<string, string> = {
        English: 'en-US',
        Spanish: 'es-ES',
        French: 'fr-FR',
        German: 'de-DE',
        Italian: 'it-IT',
        Portuguese: 'pt-PT',
        Dutch: 'nl-NL',
        Russian: 'ru-RU',
        Chinese: 'zh-CN',
        Japanese: 'ja-JP',
        Greek: 'el-GR',
        Latvian: 'lv-LV',
    };
    
    return {
        languages,
    };
};

const config = getConfig();

export default config;
