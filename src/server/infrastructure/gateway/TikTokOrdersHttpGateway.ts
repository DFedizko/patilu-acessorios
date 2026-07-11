import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type {
    ITikTokOrdersGateway,
    TikTokOrderDTO,
    TikTokOrderStatus,
} from "@/server/application/gateway/ITikTokOrdersGateway";
import type { Period } from "@/server/domain/value-object/Period";
import type { HttpClient, HttpParams } from "@/server/infrastructure/http/HttpClient";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";
import { TikTokApiError } from "@/server/infrastructure/errors/TikTokApiError";
import { TikTokHttpGateway } from "./TikTokHttpGateway";

const SHOP_HOST = "https://open-api.tiktokglobalshop.com";
const AUTH_HOST = "https://auth.tiktok-shops.com";
const API_VERSION = "202309";
const MAX_PAGE_SIZE = 100;
const ONE_DAY_SECONDS = 24 * 60 * 60;
const TOKEN_EXPIRY_SKEW_SECONDS = 60;
const MILLIS_PER_SECOND = 1000;

type TikTokTokenResponse = {
    data?: { access_token?: string; access_token_expire_in?: number; refresh_token?: string };
};

type TikTokRawOrder = {
    id?: string;
    order_number?: string;
    create_time?: number;
    status?: TikTokOrderStatus;
    order_status?: TikTokOrderStatus;
    payment?: { total_amount?: string; shipping_fee?: string };
    recipient_address?: { name?: string };
};

type TikTokOrdersSearchResponse = {
    data?: { next_page_token?: string; orders?: TikTokRawOrder[] };
};

@injectable()
export class TikTokOrdersHttpGateway extends TikTokHttpGateway implements ITikTokOrdersGateway {
    private APP_KEY = process.env.TIKTOK_SHOP_APP_KEY;
    private APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET;
    private CIPHER = process.env.TIKTOK_SHOP_CIPHER;
    private REFRESH_TOKEN = process.env.TIKTOK_SHOP_REFRESH_TOKEN;
    private ACCESS_TOKEN: string = process.env.TIKTOK_SHOP_ACCESS_TOKEN ?? "";
    private ACCESS_TOKEN_EXPIRES_AT: number = Number(process.env.TIKTOK_SHOP_ACCESS_TOKEN_EXPIRES_AT ?? 0);

    constructor(@inject(SYMBOLS.HttpClient) http: HttpClient) {
        super(http);
    }

    async searchOrders(period: Period): Promise<TikTokOrderDTO[]> {
        return this.wrapExternal(async () => {
            const createTimeGe = Math.floor(period.start.getTime() / MILLIS_PER_SECOND);
            const createTimeLt = Math.floor(period.end.getTime() / MILLIS_PER_SECOND) + ONE_DAY_SECONDS;
            const collected: TikTokOrderDTO[] = [];
            let pageToken = "";
            do {
                const response = await this.fetchOrdersPage(createTimeGe, createTimeLt, pageToken);
                const orders = response.data?.orders ?? [];
                orders.forEach((raw) => collected.push(this.mapToDTO(raw)));
                pageToken = response.data?.next_page_token ?? "";
            } while (pageToken);
            return collected;
        });
    }

    async getOrder(tiktokOrderId: string): Promise<TikTokOrderDTO> {
        return this.wrapExternal(async () => {
            const path = `/order/${API_VERSION}/orders`;
            const token = await this.getAccessToken();
            const params = await this.signedShopParams(path, { ids: tiktokOrderId });
            const response = await this.http.get<TikTokOrdersSearchResponse>(`${SHOP_HOST}${path}`, {
                params,
                headers: this.shopAuthHeaders(token),
            });
            const raw = response.data?.orders?.[0];
            if (!raw) throw new NotFoundError(`Order not found for tiktokOrderId: ${tiktokOrderId}`, "ORDER_NOT_FOUND");
            return this.mapToDTO(raw);
        });
    }

    private async fetchOrdersPage(
        createTimeGe: number,
        createTimeLt: number,
        pageToken: string,
    ): Promise<TikTokOrdersSearchResponse> {
        const path = `/order/${API_VERSION}/orders/search`;
        const token = await this.getAccessToken();
        const body = JSON.stringify({ create_time_ge: createTimeGe, create_time_lt: createTimeLt });
        const query: HttpParams = { page_size: MAX_PAGE_SIZE, page_token: pageToken || undefined };
        const params = await this.signedShopParams(path, query, body);
        return this.http.post<TikTokOrdersSearchResponse>(
            `${SHOP_HOST}${path}`,
            { create_time_ge: createTimeGe, create_time_lt: createTimeLt },
            { params, headers: this.shopAuthHeaders(token) },
        );
    }

    private async signedShopParams(path: string, extra: HttpParams, body?: string): Promise<HttpParams> {
        const params: HttpParams = {
            app_key: this.APP_KEY,
            timestamp: this.nowInSeconds(),
            shop_cipher: this.CIPHER,
            ...extra,
        };
        params.sign = this.sign(this.APP_SECRET, path, params, body);
        return params;
    }

    private async getAccessToken(): Promise<string> {
        if (this.ACCESS_TOKEN && this.ACCESS_TOKEN_EXPIRES_AT > this.nowInSeconds() + TOKEN_EXPIRY_SKEW_SECONDS) {
            return this.ACCESS_TOKEN;
        }
        return this.refreshAccessToken();
    }

    private async refreshAccessToken(): Promise<string> {
        const response = await this.http.get<TikTokTokenResponse>(`${AUTH_HOST}/api/v2/token/refresh`, {
            params: {
                app_key: this.APP_KEY,
                app_secret: this.APP_SECRET,
                refresh_token: this.REFRESH_TOKEN,
                grant_type: "refresh_token",
            },
        });
        const token = response.data?.access_token;
        if (!token) throw new TikTokApiError("TikTok token refresh returned no access_token");
        this.ACCESS_TOKEN = token;
        this.ACCESS_TOKEN_EXPIRES_AT = response.data?.access_token_expire_in ?? 0;
        return token;
    }

    private mapToDTO(raw: TikTokRawOrder): TikTokOrderDTO {
        const orderId = raw.id ?? raw.order_number ?? "";
        const createTimeSeconds = raw.create_time ?? 0;
        return {
            tiktokOrderId: orderId,
            orderNumber: raw.order_number ?? orderId,
            recipientName: raw.recipient_address?.name ?? null,
            totalAmountCents: this.toCents(raw.payment?.total_amount),
            shippingFeeCents: this.toCents(raw.payment?.shipping_fee),
            createTime: new Date(createTimeSeconds * MILLIS_PER_SECOND).toISOString(),
            orderStatus: this.resolveStatus(raw),
        };
    }

    private resolveStatus(raw: TikTokRawOrder): TikTokOrderStatus {
        return raw.status ?? raw.order_status ?? "UNPAID";
    }

    private toCents(rawAmount?: string): number {
        if (!rawAmount) return 0;
        return Math.round(parseFloat(rawAmount) * 100);
    }
}
