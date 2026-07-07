import { createHmac, timingSafeEqual } from "node:crypto";

export class TikTokWebhookVerifier {
    verify(rawBody: string, signature: string | null): boolean {
        const appKey = process.env.TIKTOK_SHOP_APP_KEY;
        const appSecret = process.env.TIKTOK_SHOP_APP_SECRET;
        if (!appKey || !appSecret) return true;
        if (!signature) return false;
        const expected = createHmac("sha256", appSecret).update(`${appKey}${rawBody}`).digest("hex");
        return this.safeEqual(expected, signature);
    }

    private safeEqual(expected: string, received: string): boolean {
        const expectedBuffer = Buffer.from(expected);
        const receivedBuffer = Buffer.from(received);
        if (expectedBuffer.length !== receivedBuffer.length) return false;
        return timingSafeEqual(expectedBuffer, receivedBuffer);
    }
}
