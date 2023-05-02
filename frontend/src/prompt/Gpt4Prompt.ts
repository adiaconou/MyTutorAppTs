class Gpt4Prompt {
    private static instance: Gpt4Prompt;
    private prompt: string;
    private languageChoice: string;
    private languageProficiency: string;
  
    private constructor() {
      this.prompt = '';
      this.languageChoice = '';
      this.languageProficiency = '';
    }
  
    public static getInstance(): Gpt4Prompt {
      if (!Gpt4Prompt.instance) {
        Gpt4Prompt.instance = new Gpt4Prompt();
      }
  
      return Gpt4Prompt.instance;
    }
  
    public getPrompt(): string {
      return this.prompt;
    }
  
    public setPrompt(prompt: string): void {
      this.prompt = prompt;
    }

    public getLanguageProficiency(): string {
        return this.languageProficiency;
    }

    public setLanguageProficiency(languageProficiency : string) {
        this.languageProficiency = languageProficiency;
    }

    public getLanguageChoice() : string {
        return this.languageChoice;
    }

    public setLanguageChoice(languageChoice: string) {
        this.languageChoice = languageChoice;
    }
  }
  
  export default Gpt4Prompt;