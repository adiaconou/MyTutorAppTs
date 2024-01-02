import BaseError from "./BaseError";

class NotFoundError extends BaseError {
    constructor(message?: string) {
        super(message || 'Object not found.');
        this.statusCode = 404;
    }
}

export default NotFoundError;