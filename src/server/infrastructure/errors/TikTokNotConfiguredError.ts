import { DomainError } from "@/server/domain/error/DomainError";

const TIKTOK_NOT_CONFIGURED_CODE = "TIKTOK_NOT_CONFIGURED";
const BAD_GATEWAY_STATUS = 502;
const DEFAULT_MESSAGE = "TikTok integration is not configured";

export class TikTokNotConfiguredError extends DomainError {
    constructor(message: string = DEFAULT_MESSAGE) {
        super(TIKTOK_NOT_CONFIGURED_CODE, BAD_GATEWAY_STATUS, message);
    }
}
