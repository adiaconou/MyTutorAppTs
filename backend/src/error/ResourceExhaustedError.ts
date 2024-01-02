import BaseError from "./BaseError";

class ResourceExhaustedError extends BaseError {
    constructor(message?: string) {
        super(message || 'Resources exhausted for this operation. Check API quotas or other service constraints.');
        this.statusCode = 429;
    }
}

export default ResourceExhaustedError;