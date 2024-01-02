import BaseError from "./BaseError";

class InternalError extends BaseError {
    constructor(message?: string) {
        super(message || 'Internal error :(');
        this.statusCode = 500;
    }
}

export default InternalError;