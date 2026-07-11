import "reflect-metadata";
import { injectable, inject } from "inversify";
import { resolvePeriod } from "@/server/application/resolve-period";
import { SYMBOLS } from "@/server/di/symbols";
import type { IAdSpendPersistenceGateway } from "@/server/application/gateway/IAdSpendPersistenceGateway";
import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { IAdSpendResolver, AdSpendResult } from "@/server/application/service/contracts/IAdSpendResolver";
import type { PeriodQueryDTO } from "@/lib/schemas";

@injectable()
export class AdSpendResolver implements IAdSpendResolver {
    constructor(
        @inject(SYMBOLS.AdSpendPersistenceGateway)
        private readonly adSpendGateway: IAdSpendPersistenceGateway,
        @inject(SYMBOLS.TikTokAdsGateway)
        private readonly tikTokAdsGateway: ITikTokAdsGateway,
    ) {}

    async resolve(input: PeriodQueryDTO): Promise<AdSpendResult> {
        const period = resolvePeriod(input);
        const tikTokResult = await this.tikTokAdsGateway.getSpend(period);
        if ("amountCents" in tikTokResult) {
            return { totalCents: tikTokResult.amountCents, available: true, source: "TIKTOK" };
        }
        const totalCents = await this.adSpendGateway.sumManualByPeriod(period);
        return { totalCents, available: false, source: "MANUAL" };
    }
}
