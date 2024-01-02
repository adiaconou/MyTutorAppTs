import BaseError from "./BaseError";

class ServiceUnavailableError extends BaseError {
    constructor(message?: string) {
        super(message || 'Service unavailable.');
        this.statusCode = 503;
    }
}

export default ServiceUnavailableError;