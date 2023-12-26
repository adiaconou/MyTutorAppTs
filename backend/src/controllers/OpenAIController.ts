import { Request, Response } from "express";
import { SecretManager } from "../auth/SecretManager";
import axios from "axios";
import OpenAI from "openai";
import fs from "fs";
import { Readable } from "stream";
import { promisify } from "util";
import path from "path";
import os from "os";

export class OpenAIController {

    private secretManager;
    
    constructor(secretManager: SecretManager) {
        this.secretManager = secretManager;
    }

    async whisperPrompt(req: Request, res: Response) {
        const newSecretManager = new SecretManager();
        const apiKey = await newSecretManager.getOpenaiApiKey();
        const openai = new OpenAI({ apiKey: apiKey });
    
        if (!req.file) {
            res.status(400).send('No audio file uploaded.');
            return;
        }
    
        // Create a temporary file path
        const tempFilePath = path.join(os.tmpdir(), 'upload.webm');
    
        try {
            // Write the buffer to a temporary file
            await fs.promises.writeFile(tempFilePath, req.file.buffer);
    
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
                language: req.body.language,
                prompt: "Transcribe exactly as you hear the audio",
            });
    
            res.json(transcription);
    
            // Optionally, delete the temporary file after usage
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error('Error deleting temp file', err);
            });
    
        } catch (error) {
            res.status(500).send(error);
        }
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