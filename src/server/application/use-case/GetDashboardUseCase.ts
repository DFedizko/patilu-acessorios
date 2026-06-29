import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Money } from "@/server/domain/value-object/Money";
import { PeriodReportCalculator } from "@/server/domain/service/PeriodReportCalculator";
import { resolvePeriod } from "@/server/application/resolve-period";
import { SYMBOLS } from "@/server/di/symbols";
import type { IReportPersistenceGateway } from "@/server/application/gateway/IReportPersistenceGateway";
import type { IGetAdSpendUseCase } from "./contracts/IGetAdSpendUseCase";
import type { IGetFixedCostUseCase } from "./contracts/IGetFixedCostUseCase";
import type { IGetDashboardUseCase, Input, Output } from "./contracts/IGetDashboardUseCase";

@injectable()
export class GetDashboardUseCase implements IGetDashboardUseCase {
    constructor(
        @inject(SYMBOLS.ReportPersistenceGateway)
        private readonly reportGateway: IReportPersistenceGateway,
        @inject(SYMBOLS.GetAdSpendUseCase)
        private readonly getAdSpend: IGetAdSpendUseCase,
        @inject(SYMBOLS.GetFixedCostUseCase)
        private readonly getFixedCost: IGetFixedCostUseCase,
        @inject(SYMBOLS.PeriodReportCalculator)
        private readonly calculator: PeriodReportCalculator,
    ) {}

    async execute(input: Input): Promise<Output> {
        const period = resolvePeriod(input);
        const [orders, adSpend, fixedCostResult] = await Promise.all([
            this.reportGateway.listByPeriod(period),
            this.getAdSpend.execute(input),
            this.getFixedCost.execute(),
        ]);
        const totalAds = Money.fromCents(adSpend.totalCents);
        const fixedCost = Money.fromCents(fixedCostResult.fixedCostPerOrderCents);
        const periodProfit = this.calculator.computePeriodProfit(orders, totalAds, fixedCost);
        const granularity = input.period === "today" ? "hour" : "day";
        const marginSeries = this.calculator.computeMarginSeries(orders, granularity);
        const costByCategory = this.calculator.computeCostByCategory(orders);
        return {
            revenueCents: periodProfit.revenue.toCents(),
            costCents: periodProfit.cost.toCents(),
            adsCents: totalAds.toCents(),
            fixedTotalCents: fixedCost.multiplyByQuantity(orders.length).toCents(),
            profitCents: periodProfit.profit.toCents(),
            avgMarginPct: periodProfit.avgMarginPct,
            orderCount: orders.length,
            marginSeries,
            costByCategory: costByCategory.map((c) => ({ categoryName: c.categoryName, costCents: c.cost.toCents() })),
            adsAvailable: adSpend.available,
        };
    }
}
