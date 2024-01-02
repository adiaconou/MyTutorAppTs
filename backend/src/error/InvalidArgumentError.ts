import BaseError from "./BaseError";

class InvalidArgumentError extends BaseError {
    constructor(message?: string) {
        super(message || 'Invalid argument.');
        this.statusCode = 400;
    }
}

export default InvalidArgumentError;