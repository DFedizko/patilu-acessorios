import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { Period } from "@/server/domain/value-object/Period";
import type { HttpClient, HttpParams } from "@/server/infrastructure/http/HttpClient";
import { TikTokApiError } from "@/server/infrastructure/errors/TikTokApiError";
import { TikTokHttpGateway } from "./TikTokHttpGateway";

const ADS_HOST = "https://business-api.tiktok.com/open_api";
const REPORT_PATH = "/v1.3/report/integrated/get/";
const ADVERTISER_INFO_PATH = "/v1.3/advertiser/info/";
const TOKEN_PATH = "/v1.3/oauth2/access_token/";
const EXPECTED_CURRENCY = "BRL";
const MAX_WINDOW_DAYS = 30;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const CENTS_PER_UNIT = 100;
const TOKEN_EXPIRY_SKEW_SECONDS = 60;

type TikTokAdsReportResponse = {
    data?: { list?: Array<{ metrics?: { spend?: string } }> };
};

type TikTokAdvertiserInfoResponse = {
    data?: { list?: Array<{ currency?: string; timezone?: string }> };
};

type TikTokAdsTokenResponse = {
    data?: { access_token?: string; access_token_expire_in?: number; expires_in?: number };
};

type AdvertiserInfo = { currency: string; timeZone: string };

type DateWindow = { startMs: number; endMs: number };

@injectable()
export class TikTokAdsHttpGateway extends TikTokHttpGateway implements ITikTokAdsGateway {
    private APP_ID = process.env.TIKTOK_ADS_APP_ID;
    private ADS_SECRET = process.env.TIKTOK_ADS_SECRET;
    private REFRESH_TOKEN = process.env.TIKTOK_ADS_REFRESH_TOKEN;
    private ADVERTISER_ID = process.env.TIKTOK_ADS_ADVERTISER_ID;
    private ACCESS_TOKEN: string = process.env.TIKTOK_ADS_ACCESS_TOKEN ?? "";
    private ACCESS_TOKEN_EXPIRES_AT: number = Number(process.env.TIKTOK_ADS_ACCESS_TOKEN_EXPIRES_AT ?? 0);
    private advertiserInfo: AdvertiserInfo | null = null;

    constructor(@inject(SYMBOLS.HttpClient) http: HttpClient) {
        super(http);
    }

    async getSpend(period: Period): Promise<{ amountCents: number } | { unavailable: true }> {
        try {
            const token = await this.getAccessToken();
            const info = await this.getAdvertiserInfo(token);
            if (info.currency !== EXPECTED_CURRENCY) {
                throw new TikTokApiError(`Ad account currency is ${info.currency}, expected ${EXPECTED_CURRENCY}`);
            }
            const windows = this.splitIntoWindows(period);
            const amounts = await Promise.all(
                windows.map((window) => this.fetchWindowSpend(window, token, info.timeZone)),
            );
            const amountCents = amounts.reduce((total, amount) => total + amount, 0);
            return { amountCents };
        } catch {
            return { unavailable: true };
        }
    }

    private async fetchWindowSpend(window: DateWindow, token: string, timeZone: string): Promise<number> {
        const params: HttpParams = {
            advertiser_id: this.ADVERTISER_ID,
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: JSON.stringify(["advertiser_id"]),
            metrics: JSON.stringify(["spend"]),
            start_date: this.toDateString(window.startMs, timeZone),
            end_date: this.toDateString(window.endMs, timeZone),
        };
        const response = await this.http.get<TikTokAdsReportResponse>(`${ADS_HOST}${REPORT_PATH}`, {
            params,
            headers: { "Access-Token": token },
        });
        const rawSpend = response.data?.list?.[0]?.metrics?.spend;
        if (!rawSpend) return 0;
        return this.parseSpendToCents(rawSpend);
    }

    private async getAdvertiserInfo(token: string): Promise<AdvertiserInfo> {
        if (this.advertiserInfo) return this.advertiserInfo;
        const response = await this.http.get<TikTokAdvertiserInfoResponse>(`${ADS_HOST}${ADVERTISER_INFO_PATH}`, {
            params: {
                advertiser_ids: JSON.stringify([this.ADVERTISER_ID]),
                fields: JSON.stringify(["currency", "timezone"]),
            },
            headers: { "Access-Token": token },
        });
        const info = response.data?.list?.[0];
        if (!info?.currency || !info?.timezone) {
            throw new TikTokApiError("TikTok advertiser info missing currency or timezone");
        }
        this.advertiserInfo = { currency: info.currency, timeZone: info.timezone };
        return this.advertiserInfo;
    }

    private async getAccessToken(): Promise<string> {
        if (this.ACCESS_TOKEN && this.ACCESS_TOKEN_EXPIRES_AT > this.nowInSeconds() + TOKEN_EXPIRY_SKEW_SECONDS) {
            return this.ACCESS_TOKEN;
        }
        return this.refreshAccessToken();
    }

    private async refreshAccessToken(): Promise<string> {
        const response = await this.http.post<TikTokAdsTokenResponse>(`${ADS_HOST}${TOKEN_PATH}`, {
            app_id: this.APP_ID,
            secret: this.ADS_SECRET,
            grant_type: "refresh_token",
            refresh_token: this.REFRESH_TOKEN,
        });
        const token = response.data?.access_token;
        if (!token) throw new TikTokApiError("TikTok ads token refresh returned no access_token");
        this.ACCESS_TOKEN = token;
        this.ACCESS_TOKEN_EXPIRES_AT =
            this.nowInSeconds() + (response.data?.access_token_expire_in ?? response.data?.expires_in ?? 0);
        return token;
    }

    private splitIntoWindows(period: Period): DateWindow[] {
        const windows: DateWindow[] = [];
        let cursor = period.start.getTime();
        const end = period.end.getTime();
        while (cursor <= end) {
            const windowEnd = Math.min(cursor + (MAX_WINDOW_DAYS - 1) * MILLIS_PER_DAY, end);
            windows.push({ startMs: cursor, endMs: windowEnd });
            cursor = windowEnd + MILLIS_PER_DAY;
        }
        return windows;
    }

    private toDateString(epochMillis: number, timeZone: string): string {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date(epochMillis));
    }

    private parseSpendToCents(rawSpend: string): number {
        return Math.round(parseFloat(rawSpend) * CENTS_PER_UNIT);
    }
}
