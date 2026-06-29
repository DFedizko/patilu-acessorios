export class ApiError extends Error {
    readonly code: string;
    readonly fields: Record<string, string[]> | undefined;
    readonly httpStatus: number;

    constructor(code: string, httpStatus: number, fields?: Record<string, string[]>) {
        super(code);
        this.code = code;
        this.httpStatus = httpStatus;
        this.fields = fields;
    }
}
