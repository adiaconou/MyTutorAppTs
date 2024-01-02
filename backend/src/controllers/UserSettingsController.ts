import { Request, Response } from "express";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsRepository } from "../repository/UserSettingsRepository";
import BaseError from "../error/BaseError";

export class UserSettingsController {
    private userSettingsRepo: UserSettingsRepository;

    constructor(userSettingsRepo: UserSettingsRepository) {
        this.userSettingsRepo = userSettingsRepo;
    }

    public async getUserSettings(req: Request, res: Response) {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "Invalid request: userId missing" });
        }

        try {
            const userSettings = await this.userSettingsRepo.getUserSettings(userId);
            res.json(userSettings);
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: `Error getting user settings for userId ${userId}` });
            }
        }
    }

    public async updateUserSettings(req: Request, res: Response) {
        const userId = req.params.userId;
        const settings = req.body.settings;

        if (!userId || !settings) {
            return res.status(400).json({ message: `Invalid request: missing userId (${userId}) or user settings (${settings})` });
        }

        try {
            const userSettings: UserSettings = {
                userId,
                settings,
            };

            const updatedUserSettings = await this.userSettingsRepo.updateUserSettings(userId, userSettings);
            res.json(updatedUserSettings);
        } catch (error) {
            if (error instanceof BaseError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                res.status(500).json({ message: `Error updating  user settings for userId ${userId}, settings ${settings}` });
            }
        }
    }
}