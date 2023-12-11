import { request } from "http";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class LanguageTranslationService {
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