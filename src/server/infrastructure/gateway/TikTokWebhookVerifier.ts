import { createHmac, timingSafeEqual } from "node:crypto";

export class TikTokWebhookVerifier {
    private APP_KEY = process.env.TIKTOK_SHOP_APP_KEY;
    private APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET;

    verify(rawBody: string, signature: string | null): boolean {
        if (!this.APP_KEY || !this.APP_SECRET) return true;
        if (!signature) return false;
        const expected = createHmac("sha256", this.APP_SECRET).update(`${this.APP_KEY}${rawBody}`).digest("hex");
        return this.safeEqual(expected, signature);
    }

    private safeEqual(expected: string, received: string): boolean {
        const expectedBuffer = Buffer.from(expected);
        const receivedBuffer = Buffer.from(received);
        if (expectedBuffer.length !== receivedBuffer.length) return false;
        return timingSafeEqual(expectedBuffer, receivedBuffer);
    }
}
