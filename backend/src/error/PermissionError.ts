import BaseError from "./BaseError";

class PermissionError extends BaseError {
    constructor(message?: string) {
        super(message || 'You do not have permission to execute this operation.');
        this.statusCode = 403;
    }
}

export default PermissionError;