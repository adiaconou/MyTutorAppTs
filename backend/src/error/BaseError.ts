class BaseError extends Error {
    statusCode: number;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500; // Default status code
        Error.captureStackTrace(this, this.constructor);
    }
}

export default BaseError;