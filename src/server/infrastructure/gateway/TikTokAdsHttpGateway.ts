import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { Period } from "@/server/domain/value-object/Period";
import type { TikTokAdsTranslator } from "@/server/domain/acl/TikTokAdsTranslator";
import type { HttpClient, HttpParams } from "@/server/infrastructure/http/HttpClient";
import { TikTokHttpGateway } from "./TikTokHttpGateway";

const ADS_HOST = "https://business-api.tiktok.com/open_api";
const REPORT_PATH = "/v1.3/report/integrated/get/";
const MAX_WINDOW_DAYS = 30;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

type TikTokAdsReportResponse = {
    data?: { list?: Array<{ metrics?: { spend?: string } }> };
};

type DateWindow = { startDate: string; endDate: string };

@injectable()
export class TikTokAdsHttpGateway extends TikTokHttpGateway implements ITikTokAdsGateway {
    constructor(
        @inject(SYMBOLS.HttpClient) http: HttpClient,
        @inject(SYMBOLS.TikTokAdsTranslator) private readonly translator: TikTokAdsTranslator,
    ) {
        super(http);
    }

    async getSpend(period: Period): Promise<{ amountCents: number } | { unavailable: true }> {
        try {
            const windows = this.splitIntoWindows(period);
            const amounts = await Promise.all(windows.map((window) => this.fetchWindowSpend(window)));
            const amountCents = amounts.reduce((total, amount) => total + amount, 0);
            return { amountCents };
        } catch {
            return this.translator.toUnavailable();
        }
    }

    private async fetchWindowSpend(window: DateWindow): Promise<number> {
        const advertiserId = this.requireEnv("TIKTOK_ADS_ADVERTISER_ID");
        const accessToken = this.requireEnv("TIKTOK_ADS_ACCESS_TOKEN");
        const params: HttpParams = {
            advertiser_id: advertiserId,
            report_type: "BASIC",
            data_level: "AUCTION_ADVERTISER",
            dimensions: JSON.stringify(["advertiser_id"]),
            metrics: JSON.stringify(["spend"]),
            start_date: window.startDate,
            end_date: window.endDate,
        };
        const response = await this.http.get<TikTokAdsReportResponse>(`${ADS_HOST}${REPORT_PATH}`, {
            params,
            headers: { "Access-Token": accessToken },
        });
        const rawSpend = response.data?.list?.[0]?.metrics?.spend;
        if (!rawSpend) return 0;
        return this.translator.toAmountCents(rawSpend);
    }

    private splitIntoWindows(period: Period): DateWindow[] {
        const windows: DateWindow[] = [];
        let cursor = period.start.getTime();
        const end = period.end.getTime();
        while (cursor <= end) {
            const windowEnd = Math.min(cursor + (MAX_WINDOW_DAYS - 1) * MILLIS_PER_DAY, end);
            windows.push({ startDate: this.toDateString(cursor), endDate: this.toDateString(windowEnd) });
            cursor = windowEnd + MILLIS_PER_DAY;
        }
        return windows;
    }

    private toDateString(epochMillis: number): string {
        return new Date(epochMillis).toISOString().slice(0, 10);
    }
}
