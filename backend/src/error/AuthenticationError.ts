import BaseError from "./BaseError";

class AuthenticationError extends BaseError {
    constructor(message?: string) {
        super(message || 'You do not have valid authentication credentials for the operation.');
        this.statusCode = 401;
    }
}

export default AuthenticationError;