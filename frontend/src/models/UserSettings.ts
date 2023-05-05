export interface UserSettings {
    userId: string;
    settings: {
      languageChoice: string;
      languageProficiency: number;
      sourceLanguage: string;
    };
  }