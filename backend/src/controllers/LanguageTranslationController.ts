
import { v2 } from '@google-cloud/translate';
import { Request, Response } from "express";

export class LanguageTranslationController {
    private translateClient: v2.Translate;

    constructor() {
        this.translateClient = new v2.Translate();
    }

    // Translate text into a target language
    async translateText(req: Request, res: Response) {
        const text = req.body.text;
        const target = req.body.target;

        let [translations] = await this.translateClient.translate(text, target);

        console.log("Translations: " + translations);
        res.json(translations);
    }
}