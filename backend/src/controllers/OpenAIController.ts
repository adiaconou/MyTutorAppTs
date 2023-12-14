import { Request, Response } from "express";
import { SecretManager } from "../auth/SecretManager";
import axios from "axios";

export class OpenAIController {

    private secretManager;

    constructor(secretManager: SecretManager) {
        this.secretManager = secretManager;
    }

    async chatgptPrompt(req: Request, res: Response) {
        const messages = req.body.messages;

        const data = {
            model: "gpt-4",
            messages: messages,
        };

        const apiKey = await this.secretManager.getOpenaiApiKey();

        const headers = {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        };

        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", data, {
                headers: headers,
            });

            // Extract headers from the OpenAI response
            const openAIResponseHeaders = response.headers;

            // Loop through the headers and append them to the Express response
            for (const header in openAIResponseHeaders) {
                if (openAIResponseHeaders.hasOwnProperty(header)) {
                    res.setHeader(header, openAIResponseHeaders[header]);
                }
            }

            const json = response.data as CompletionResponse;
            res.json(json);
        } catch (error) {
            console.error(`Error Response`, error);
            return null;
        }
    }
}

interface CompletionResponse {
    choices?: {
        message: {
            content: string;
        };
    }[];
}