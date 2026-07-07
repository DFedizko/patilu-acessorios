import { createHmac } from "node:crypto";
import type { HttpClient, HttpHeaders, HttpParams } from "@/server/infrastructure/http/HttpClient";
import { TikTokApiError } from "@/server/infrastructure/errors/TikTokApiError";
import { TikTokNotConfiguredError } from "@/server/infrastructure/errors/TikTokNotConfiguredError";

const MILLIS_PER_SECOND = 1000;

export type TikTokShopConfig = {
    appKey: string;
    appSecret: string;
    accessToken: string;
    refreshToken: string;
    shopCipher: string;
};

export abstract class TikTokHttpGateway {
    protected constructor(protected readonly http: HttpClient) {}

    protected nowInSeconds(): number {
        return Math.floor(Date.now() / MILLIS_PER_SECOND);
    }

    protected sign(appSecret: string, path: string, queryParams: HttpParams, body?: string): string {
        const keys = Object.keys(queryParams)
            .filter((key) => key !== "sign" && key !== "access_token" && queryParams[key] !== undefined)
            .sort();
        const concatenatedParams = keys.reduce((acc, key) => `${acc}${key}${queryParams[key]}`, "");
        const payload = `${appSecret}${path}${concatenatedParams}${body ?? ""}${appSecret}`;
        return createHmac("sha256", appSecret).update(payload).digest("hex");
    }

    protected shopAuthHeaders(accessToken: string): HttpHeaders {
        return { "x-tts-access-token": accessToken, "Content-Type": "application/json" };
    }

    protected requireEnv(name: string): string {
        const value = process.env[name];
        if (!value) throw new TikTokNotConfiguredError(`Missing required TikTok env var: ${name}`);
        return value;
    }

    protected async wrapExternal<T>(action: () => Promise<T>): Promise<T> {
        try {
            return await action();
        } catch (error) {
            if (error instanceof TikTokNotConfiguredError) throw error;
            const detail = error instanceof Error ? error.message : "unknown error";
            throw new TikTokApiError(`TikTok request failed: ${detail}`);
        }
    }
}
