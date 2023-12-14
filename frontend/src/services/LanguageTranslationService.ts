import { request } from "http";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class LanguageTranslationService {

    // Translate text to target language
    async translate(text: string, target: string, token: string): Promise<string> {
        const headers = this.createAuthHeaders(token);
        headers.append("Content-Type", "application/json");

        const requestBody = {
            text: text,
            target: target,
        };

        try {
            console.log("Sending translation request");
            const response = await this.sendRequest(`${apiUrl}/translate`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
            });

            return await response.json();
        } catch (error) {
            console.log("Error translating: ", error);
            throw error;
        }
    }

    // Convert text to speech
    async getTextToSpeech(text: string, jwtToken: string): Promise<string | null> {
        const requestBody = {
          text: text,
        };
    
        const headers = {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        };
    
        try {
          const response = await this.sendRequest(`${apiUrl}/textToSpeech`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody),
          });
    
          const json = (await response.json());
    
          return json;
        } catch (error) {
          console.log("Error request chatgpt prompt", error);
          throw error;
        }
      }

    // Create http headers with auth
    private createAuthHeaders(token: string): Headers {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        return headers;
    }

    private async sendRequest(url: string, options: RequestInit): Promise<Response> {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error status ${response.status}`);
        }
        return response;
      }

}