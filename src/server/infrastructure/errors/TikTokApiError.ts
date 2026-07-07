import { DomainError } from "@/server/domain/error/DomainError";

const TIKTOK_API_ERROR_CODE = "TIKTOK_API_ERROR";
const BAD_GATEWAY_STATUS = 502;

export class TikTokApiError extends DomainError {
    constructor(message: string) {
        super(TIKTOK_API_ERROR_CODE, BAD_GATEWAY_STATUS, message);
    }
}
