export interface UserSettings {
    userId: string;
    settings: {
      sourceLanguage: string;
      languageChoice: string;
      languageProficiency: number;
    };
  }