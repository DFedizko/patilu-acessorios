import { resolvePeriod } from "@/server/application/resolve-period";
import type { PeriodQueryDTO } from "@/lib/schemas";
import type { ITikTokOrdersGateway } from "@/server/application/gateway/ITikTokOrdersGateway";
import type { IIngestTikTokOrderUseCase } from "@/server/application/use-case/contracts/IIngestTikTokOrderUseCase";
import type { IGetAdSpendUseCase } from "@/server/application/use-case/contracts/IGetAdSpendUseCase";

export type TikTokSyncResult = { ingestedOrders: number; adSpendCents: number; adSpendAvailable: boolean };

export class TikTokSyncJob {
    constructor(
        private readonly ordersGateway: ITikTokOrdersGateway,
        private readonly ingestOrderUseCase: IIngestTikTokOrderUseCase,
        private readonly getAdSpendUseCase: IGetAdSpendUseCase,
    ) {}

    async run(query: PeriodQueryDTO): Promise<TikTokSyncResult> {
        const ingestedOrders = await this.backfillOrders(query);
        const adSpend = await this.getAdSpendUseCase.execute(query);
        return { ingestedOrders, adSpendCents: adSpend.totalCents, adSpendAvailable: adSpend.available };
    }

    private async backfillOrders(query: PeriodQueryDTO): Promise<number> {
        const period = resolvePeriod(query);
        const orders = await this.ordersGateway.searchOrders(period);
        await Promise.all(orders.map((tiktokOrderDTO) => this.ingestOrderUseCase.execute({ tiktokOrderDTO })));
        return orders.length;
    }
}
