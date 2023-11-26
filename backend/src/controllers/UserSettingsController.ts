import { Request, Response } from "express";
import { UserSettings } from "../models/UserSettings";
import { UserSettingsRepository } from "../dataAccess/UserSettingsRepository";

export class UserSettingsController {
    private userSettingsRepo: UserSettingsRepository;

    constructor() {
        this.userSettingsRepo = new UserSettingsRepository("for-fun-153903");
    }

    public async getUserSettings(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const userSettings = await this.userSettingsRepo.getUserSettings(userId);
            res.json(userSettings);
        } catch (error) {
            res.status(500).json({ message: "Error fetching user settings" });
        }
    }

    public async updateUserSettings(req: Request, res: Response) {
        try {
            const userId = req.params.userId;
            const settings = req.body.settings;

            if (!settings) {
                res.status(400).json({ message: "Invalid request data" });
                return;
            }

            const userSettings: UserSettings = {
                userId,
                settings,
            };

            const updatedUserSettings = await this.userSettingsRepo.updateUserSettings(userId, userSettings);
            res.json(updatedUserSettings);
        } catch (error) {
            res.status(500).json({ message: `Error updating user settings ${error}` });
        }
    }
}