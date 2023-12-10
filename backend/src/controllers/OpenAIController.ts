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
            model: "gpt-3.5-turbo",
            // model: "gpt-4",
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

            const json = response.data as CompletionResponse;
            res.json(json);
        } catch (error) {
            console.error(`Error Response`, error);
            return null;
        }
    }
}

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