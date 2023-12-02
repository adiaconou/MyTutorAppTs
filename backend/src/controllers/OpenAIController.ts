import { Request, Response } from "express";
import { SecretManager } from "../auth/SecretManager";
import axios from "axios";

export class OpenAIController {

    private secretManager;

    constructor(secretManager: SecretManager) {
        this.secretManager = secretManager;
    }

    async chatgptPrompt(req: Request, res: Response) {
        const prompt = req.body.context;
        const role = req.body.role;

        const data = {
            model: "gpt-3.5-turbo",
            messages: [{ role: role, content: JSON.stringify(prompt) }] as Message[],
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
            console.error("Error: ", error);
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