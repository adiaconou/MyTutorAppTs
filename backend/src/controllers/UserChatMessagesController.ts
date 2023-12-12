import { Request, Response } from "express";
import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatMessagesRepository } from "../repository/UserChatMessagesRepository";

export class UserChatMessagesController {
    private userChatMessagesRepo: UserChatMessagesRepository;

    constructor(userChatMessageRepo: UserChatMessagesRepository) {
        this.userChatMessagesRepo = userChatMessageRepo;
    }

    async writeMessage(req: Request, res: Response) {
        try {
            const id = req.body.id;
            const chatSessionId = req.body.chatSessionId;
            const displayableText = req.body.displayableText;
            const rawText = req.body.rawText;
            const timestamp = req.body.timestamp;
            const sender = req.body.sender;
            const isVisibleToUser = req.body.isVisibleToUser;

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
            res.status(500).json({ message: "Error adding new message" });
        }
    }

    async getMessagesByUserId(req: Request, res: Response) {
        try {
            // Access query parameters using req.query
            const chatSessionId = req.query.chatSessionId as string;
            const limitStr = req.query.limit as string;

            // Validate query parameters
            if (!chatSessionId || !limitStr) {
                return res.status(400).json({ message: "Missing userId or limit" });
            }

            // Convert limit to an integer
            const limit = parseInt(limitStr, 10);

            // Check if limit is a valid number
            if (isNaN(limit)) {
                return res.status(400).json({ message: "Invalid limit" });
            }

            const session = await this.userChatMessagesRepo.getById(chatSessionId, limit);

            res.json(session);
        } catch (error) {
            res
                .status(500)
                .json({ message: "Error fetching chat session list " + error });
        }
    }
}