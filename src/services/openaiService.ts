const apiKey = "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";

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

interface Message {
  role: string;
  content: string;
}

interface CompletionResponse {
  choices?: {
    message: {
      content: string;
    };
  }[];
}

const promptGPT = async (prompt: string, maxTokens: number = 50): Promise<string | null> => {
  const data = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: JSON.stringify(prompt) }] as Message[],
  };

  try {
    console.log("TEST");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const json = (await response.json()) as CompletionResponse;

    if (!json.choices) {
      return "Undefined";
    }

    return json.choices[0].message.content;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

export default promptGPT;