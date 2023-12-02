
const apiUrl = process.env.REACT_APP_BACKEND_URL;

export class OpenAIService {
  async prompt(context: string, role: string, jwtToken: string, maxTokens: number = 50): Promise<string | null> {
    // Create http request body
    const requestBody = {
      context: context,
      role: role,
      maxTokens: maxTokens,
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
    console.log(`[Request] ${options.method} ${url}`);
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