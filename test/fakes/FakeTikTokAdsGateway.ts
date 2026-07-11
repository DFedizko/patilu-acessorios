import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { Period } from "@/server/domain/value-object/Period";

export class FakeTikTokAdsGateway implements ITikTokAdsGateway {
    async getSpend(_period: Period): Promise<{ amountCents: number } | { unavailable: true }> {
        return { unavailable: true };
    }
}
