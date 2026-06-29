const NOT_FOUND_STATUS = 404;
const DEFAULT_NOT_FOUND_CODE = "NOT_FOUND";
const DEFAULT_NOT_FOUND_MESSAGE = "Resource not found";

export class NotFoundError extends Error {
    readonly httpStatus = NOT_FOUND_STATUS;
    readonly code: string;

    constructor(message: string = DEFAULT_NOT_FOUND_MESSAGE, code: string = DEFAULT_NOT_FOUND_CODE) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
}
