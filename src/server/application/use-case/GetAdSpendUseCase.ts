import "reflect-metadata";
import { injectable, inject } from "inversify";
import { resolvePeriod } from "@/server/application/resolve-period";
import { SYMBOLS } from "@/server/di/symbols";
import type { IAdSpendPersistenceGateway } from "@/server/application/gateway/IAdSpendPersistenceGateway";
import type { ITikTokAdsGateway } from "@/server/application/gateway/ITikTokAdsGateway";
import type { IGetAdSpendUseCase, Input, Output } from "./contracts/IGetAdSpendUseCase";

@injectable()
export class GetAdSpendUseCase implements IGetAdSpendUseCase {
    constructor(
        @inject(SYMBOLS.AdSpendPersistenceGateway)
        private readonly adSpendGateway: IAdSpendPersistenceGateway,
        @inject(SYMBOLS.TikTokAdsGateway)
        private readonly tikTokAdsGateway: ITikTokAdsGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        const period = resolvePeriod(input);
        const tikTokResult = await this.tikTokAdsGateway.getSpend(period);
        if ("amountCents" in tikTokResult) {
            await this.adSpendGateway.upsertDay(period.start, tikTokResult.amountCents, "TIKTOK");
            return { totalCents: tikTokResult.amountCents, available: true, source: "TIKTOK" };
        }
        const totalCents = await this.adSpendGateway.sumManualByPeriod(period);
        return { totalCents, available: false, source: "MANUAL" };
    }
}
