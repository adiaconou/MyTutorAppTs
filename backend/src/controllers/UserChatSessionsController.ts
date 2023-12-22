import { Request, Response } from "express";
import { UserChatSessionRepository } from "../repository/UserChatSessionRepository";
import { UserChatMessage } from "../models/UserChatMessage";
import { UserChatSession } from "../models/UserChatSession";

export class UserChatSessionsController {

  private userChatSessionRepo: UserChatSessionRepository;

  constructor(userChatSessionRepo: UserChatSessionRepository) {
    this.userChatSessionRepo = userChatSessionRepo;
  }

  async saveChatSession(req: Request, res: Response) {
    try {
      // Extract 'session' and 'initialMessages' from the request body
      const { session, initialMessages } = req.body;

      // Validate and destructure the 'session' object
      if (!session) {
        return res
          .status(400)
          .json({ message: "Missing session object in request body" });
      }
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

      // Validate and handle the 'initialMessages' object
      if (initialMessages && Array.isArray(initialMessages) && initialMessages.length > 0) {
        // Ensure all messages have the correct chatSessionId
        const messagesToStore: UserChatMessage[] = initialMessages.map(message => ({
          ...message,
          chatSessionId: sessionToCreate.id,
        }));

        // Use the new repository method to add multiple messages
        await this.userChatSessionRepo.saveNew(sessionToCreate.id, sessionToCreate, messagesToStore);
      }

      res.status(204).send();
    } catch (error) {
      console.log("Error creating chat session: ", error);
      res.status(500).json({ message: "Error creating chat session" });
    }
  }


  async createChatSession(req: Request, res: Response) {
    try {
      // Extract 'session' and 'initialMessage' from the request body
      const { session, initialMessage } = req.body;

      // Validate and destructure the 'session' object
      if (!session) {
        return res
          .status(400)
          .json({ message: "Missing session object in request body" });
      }
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

      // Validate and destructure the 'initialMessage' object (if needed)
      if (initialMessage) {
        const {
          id: messageId,
          chatSessionId,
          displayableText,
          rawText,
          timestamp,
          sender,
        } = initialMessage as UserChatMessage;

        await this.userChatSessionRepo.createNew(
          sessionToCreate.id,
          sessionToCreate,
          initialMessage.id,
          initialMessage
        );
      } else {
        await this.userChatSessionRepo.create(id, session);
      }

      res.status(204).send();
    } catch (error) {
      console.log("Error creating chat session: " + error);
      res.status(500).json({ message: "Error creating chat session" });
    }
  }

  async deleteChatSession(req: Request, res: Response) {
    try {
      const id = req.params.id;

      console.log("Deleteing chat session " + id);
      // Delete the chat session
      await this.userChatSessionRepo.deleteSessionAndMessages(id);

      // Optional: Delete all messages associated with the chat session
      // await userMessageRepo.deleteByChatSessionId(id);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chat session: ", error);
      res.status(500).json({ message: "Error deleting chat session" });
    }
  }

  async getChatSessionById(req: Request, res: Response) {
    try {
      console.log("getChatSessionById " + req.params.id);
      const id = req.params.id;
      const session = await this.userChatSessionRepo.get(id);
      res.json(session);
    } catch (error) {
      console.log("No chat session " + error);
      res.status(500).json({ message: "Error fetching chat session" });
    }
  }

  async getChatSessionsByUserId(req: Request, res: Response) {
    try {
      // Access query parameters using req.query
      const userId = req.query.userId as string;
      const limitStr = req.query.limit as string;

      // Validate query parameters
      if (!userId || !limitStr) {
        return res.status(400).json({ message: "Missing userId or limit" });
      }

      // Convert limit to an integer
      const limit = parseInt(limitStr, 10);

      // Check if limit is a valid number
      if (isNaN(limit)) {
        return res.status(400).json({ message: "Invalid limit" });
      }

      const session = await this.userChatSessionRepo.getByUserId(userId, limit, 1);

      res.json(session);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching chat session list " + error });
    }
  }
}