"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const SecretManager_1 = require("./auth/SecretManager");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
require("./auth/PassportSetup");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = __importDefault(require("./config"));
const secretManager = new SecretManager_1.SecretManager();
const app = (0, express_1.default)();
// Async function to initialize the app
async function initializeApp() {
    // Enable CORS for your frontend
    app.use((0, cors_1.default)({
        origin: config_1.default.frontendUrl,
        credentials: true
    }));
    // Other middleware setup
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    const sessionSecret = await secretManager.getExpressUserSessionSecret();
    app.use((0, express_session_1.default)({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000, secure: 'auto' },
    }));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    app.use(routes_1.default);
    app.listen(config_1.default.port, () => {
        console.log(`Backend server listening on port ${config_1.default.port}`);
    });
}
// Call the async function to start the app
initializeApp().catch(console.error);
