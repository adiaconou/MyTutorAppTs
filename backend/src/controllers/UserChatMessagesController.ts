import { Request, Response } from "express";
import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatMessagesRepository } from "../repository/UserChatMessagesRepository";
import BaseError from "../error/BaseError";

export class UserChatMessagesController {
    private userChatMessagesRepo: UserChatMessagesRepository;

    constructor(userChatMessageRepo: UserChatMessagesRepository) {
        this.userChatMessagesRepo = userChatMessageRepo;
    }

    async writeMessage(req: Request, res: Response) {
        const id = req.body.id;
        const chatSessionId = req.body.chatSessionId;
        const displayableText = req.body.displayableText;
        const rawText = req.body.rawText;
        const timestamp = req.body.timestamp;
        const sender = req.body.sender;
        const isVisibleToUser = req.body.isVisibleToUser;

        if (!id || !chatSessionId || !displayableText || !rawText || !timestamp || !sender || !isVisibleToUser) {
            return res.status(400).json({ message: "Invalid request: Missing field" });
        }

        try {
            const newMessage: UserChatMessage = {
                id,
                chatSessionId,
                displayableText,
                rawText,
                timestamp,
                sender,
                isVisibleToUser,
            };

            const updatedUserSettings = await this.userChatMessagesRepo.add(id, newMessage);
            res.json(updatedUserSettings);
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Error adding new message" });
            }
        }
    }

    async getMessagesByUserId(req: Request, res: Response) {
        const chatSessionId = req.query.chatSessionId as string;
        const limitStr = req.query.limit as string;

        if (!chatSessionId || !limitStr) {
            return res.status(400).json({ message: `Invalid request: Missing chatSessionId (${chatSessionId}) or limit (${limitStr})` });
        }

        const limit = parseInt(limitStr, 10);

        // Check if limit is a valid number
        if (isNaN(limit)) {
            return res.status(400).json({ message: "Limit is not a valid numerical value" });
        }

        try {
            const session = await this.userChatMessagesRepo.getById(chatSessionId, limit);
            res.json(session);
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Error getting messages" });
            }
        }
    }
}