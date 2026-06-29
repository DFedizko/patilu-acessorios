import type { Period } from "@/server/domain/value-object/Period";

export interface ITikTokAdsGateway {
    getSpend(period: Period): Promise<{ amountCents: number } | { unavailable: true }>;
}
