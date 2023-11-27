import { Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { SecretManager } from "../auth/SecretManager";

const secretManager = new SecretManager();

export class AuthController {


    async googleAuthCallback(req: Request, res: Response) {
        try {
            const user: GoogleUser = req.user as GoogleUser;
            const JWT_SECRET = await secretManager.getJwtSecret();

            const { id, displayName, emails } = user;
            const token = jwt.sign(
                {
                    userID: id,
                    displayName,
                    email: emails && emails.length > 0 ? emails[0].value : null,
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
            res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
        } catch (error) {
            console.error("Error in googleAuthCallback: ", error);
            res.status(500).send("An error occurred");
        }
    }

    async checkAuthStatus(req: Request, res: Response) {
        try {
            const token = req.cookies.token;
            if (token) {
                const JWT_SECRET = await secretManager.getJwtSecret();

                try {
                    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
                    res.json({ authenticated: true, ...decodedToken });
                } catch (err) {
                    console.log("Token verification failed: ", err);
                    res.json({ authenticated: false });
                }
            } else {
                res.json({ authenticated: false });
            }
        } catch (error) {
            console.error("Error in checkAuthStatus: ", error);
            res.status(500).send("An error occurred");
        }
    }

    logout(req: Request, res: Response) {
        res.clearCookie('token');
        res.json({ message: 'Logged out' });
    }
}

// Move to helper class

interface GoogleUser {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: Array<{ value: string, verified: boolean }>;
    photos: Array<{ value: string }>;
    provider: string;
    _raw: string;
    _json: {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email: string;
        email_verified: boolean;
        locale: string;
    };
}