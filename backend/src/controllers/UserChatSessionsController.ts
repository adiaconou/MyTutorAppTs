import { Request, Response } from "express";
import { UserChatSessionRepository } from "../repository/UserChatSessionRepository";
import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";
import BaseError from "../error/BaseError";

export class UserChatSessionsController {

  private userChatSessionRepo: UserChatSessionRepository;

  constructor(userChatSessionRepo: UserChatSessionRepository) {
    this.userChatSessionRepo = userChatSessionRepo;
  }

  async saveChatSession(req: Request, res: Response) {
    const { session, initialMessages } = req.body;

    if (!session || !initialMessages || !Array.isArray(initialMessages) || initialMessages.length === 0) {
      return res.status(400).json({
        message: `Invalid request: Missing chat session (${session}) or initial message (${initialMessages}) object in request`
      });
    }

    try {
      const { userId, id, createdAt, lastUpdatedAt, summary, sourceLanguage, targetLanguage } =
        session as UserChatSession;

      // Create the session object to be stored in the repository
      const sessionToCreate: UserChatSession = {
        userId,
        id,
        createdAt: new Date(createdAt),
        lastUpdatedAt: new Date(lastUpdatedAt),
        summary,
        sourceLanguage,
        targetLanguage,
      };

      // Ensure all messages have the correct chatSessionId
      const messagesToStore: UserChatMessage[] = initialMessages.map(message => ({
        ...message,
        chatSessionId: sessionToCreate.id,
      }));

      await this.userChatSessionRepo.saveNew(sessionToCreate.id, sessionToCreate, messagesToStore);
      res.status(204).send();
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating chat session" });
      }
    }
  }

  async deleteChatSession(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Invalid request: no id in request" });
    }

    try {
      // Deletes session object and all associated messages
      await this.userChatSessionRepo.deleteSessionAndMessages(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message })
      } else {
        res.status(500).json({ message: `Error deleting chat session id: ${id}` });
      }
    }
  }

  async getChatSessionById(req: Request, res: Response) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Invalid request: no id in request" });
    }

    try {
      const session = await this.userChatSessionRepo.get(id);
      res.json(session);
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message })
      } else {
        res.status(500).json({ message: `Error fetching chat session id: ${id}` });
      }
    }
  }

  async getChatSessionsByUserId(req: Request, res: Response) {
    const userId = req.query.userId as string;
    const limitStr = req.query.limit as string;

    if (!userId || !limitStr) {
      return res.status(400).json({ message: `Invalid request: Missing userId (${userId}) or limit (${limitStr})` });
    }

    const limit = parseInt(limitStr, 10);

    // Check if limit is a valid number
    if (isNaN(limit)) {
      return res.status(400).json({ message: `limit is not a valid numeric value: ${limitStr}` });
    }

    try {
      const session = await this.userChatSessionRepo.getByUserId(userId, limit, 1);
      res.json(session);
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ message: error.message })
      } else {
        res.status(500).json({ message: `Error fetching chat sessions for userId ${userId}` });
      }
    }
  }
}