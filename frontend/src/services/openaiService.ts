import { Message } from "../models/Message";

const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class OpenAIService {

  async transcribe(audioBlob: Blob, jwtToken: string, language?: string): Promise<string | null> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    if (language) {
      formData.append('language', language);
    }

    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      // 'Content-Type' is not required here as it's set automatically by the browser when using FormData
    };

    try {
      const response = await fetch(`${apiUrl}/transcriptions`, {
        method: "POST",
        headers: headers,
        body: formData,
      });
      const data = await response.json();
      return data.text; 
    } catch (error) {
      console.log("Error requesting transcription", error);
    }

    return null;
  }

  async prompt(context: Message[], jwtToken: string, maxTokens: number = 50): Promise<string | null> {
    // Create a conversation array by mapping the messages to the required format
    const conversation = context.map((message) => ({
      role: message.isUser ? 'user' : 'system',
      content: message.rawText,
    }));

    // Create the request body
    const requestBody = {
      messages: conversation,
      max_tokens: maxTokens,
    };

    const headers = {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await this.sendRequest(`${apiUrl}/prompt`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const json = (await response.json()) as CompletionResponse;

      if (!json.choices) {
        return "Undefined";
      }

      return json.choices[0].message.content;
    } catch (error) {
      console.log("Error request chatgpt prompt", error);
      throw error;
    }
  };

  private async sendRequest(url: string, options: RequestInit): Promise<Response> {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }
    return response;
  }
}

interface CompletionResponse {
  choices?: {
    message: {
      content: string;
    };
  }[];
}