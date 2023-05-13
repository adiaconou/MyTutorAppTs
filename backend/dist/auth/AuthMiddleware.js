"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirect to the Google auth route if the user is not authenticated
    res.redirect('/auth/google');
};
exports.isAuthenticated = isAuthenticated;
