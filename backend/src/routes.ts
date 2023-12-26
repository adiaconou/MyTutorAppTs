import express from "express";
import { UserSettingsController } from "./controllers/UserSettingsController";
import { UserChatSessionsController } from "./controllers/UserChatSessionsController";
import { UserChatMessagesController } from "./controllers/UserChatMessagesController";
import { CloudLogController } from "./controllers/CloudLogController";
import { SecretManager } from "./auth/SecretManager";
import config from "./config";
import { UserChatMessagesRepository } from "./repository/UserChatMessagesRepository";
import { UserChatSessionRepository } from "./repository/UserChatSessionRepository";
import { UserSettingsRepository } from "./repository/UserSettingsRepository";
import { checkJwt } from "./auth/JwtChecker";
import { OpenAIController } from "./controllers/OpenAIController";
import { LanguageTranslationController } from "./controllers/LanguageTranslationController";
const { TextToSpeechController } = require('./controllers/TextToSpeechController');
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const cloudLogController = new CloudLogController(new SecretManager());
const userSettingsController = new UserSettingsController(new UserSettingsRepository(config.googleProjectId));
const userChatSessionsController = new UserChatSessionsController(new UserChatSessionRepository(config.googleProjectId));
const userChatMessagesController = new UserChatMessagesController(new UserChatMessagesRepository(config.googleProjectId));
const openaiController = new OpenAIController(new SecretManager());
const languageTranslationController = new LanguageTranslationController();
const textToSpeechController = new TextToSpeechController();

// UserSettings routes
router.get("/userSettings/:userId", checkJwt, userSettingsController.getUserSettings.bind(userSettingsController)); 
router.put("/userSettings/:userId", checkJwt, userSettingsController.updateUserSettings.bind(userSettingsController));

// UserChatSessions routes
// router.put("/chatSessions/:id", checkJwt, userChatSessionsController.createChatSession.bind(userChatSessionsController));
router.put("/chatSessions/:id", checkJwt, userChatSessionsController.saveChatSession.bind(userChatSessionsController));

router.get("/chatSessions/:id", checkJwt, userChatSessionsController.getChatSessionById.bind(userChatSessionsController));
router.get("/chatSessions/", checkJwt, userChatSessionsController.getChatSessionsByUserId.bind(userChatSessionsController));
router.delete("/chatSessions/:id", checkJwt, userChatSessionsController.deleteChatSession.bind(userChatSessionsController));

// UserChatMessages routes
router.put("/messages/:id", checkJwt, userChatMessagesController.writeMessage.bind(userChatMessagesController));
router.get("/messages/", checkJwt, userChatMessagesController.getMessagesByUserId.bind(userChatMessagesController));

// Cloud logging routes
router.put("/log", checkJwt, cloudLogController.writeLog.bind(cloudLogController));

// Text Translation routes
router.post("/translate", checkJwt, languageTranslationController.translateText.bind(languageTranslationController));
router.post('/transcriptions', upload.single('audio'), openaiController.whisperPrompt);

// OpenAI routes
router.post("/prompt", checkJwt, openaiController.chatgptPrompt.bind(openaiController));

// Text to speech
router.post("/textToSpeech", checkJwt, textToSpeechController.googleTextToSpeech.bind(textToSpeechController));

export default router;