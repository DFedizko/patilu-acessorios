import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Money } from "@/server/domain/value-object/Money";
import type { FixedCosts } from "@/server/domain/value-object/FixedCosts";
import { PeriodReportCalculator } from "@/server/domain/service/PeriodReportCalculator";
import { resolvePeriod } from "@/server/application/resolve-period";
import { SYMBOLS } from "@/server/di/symbols";
import type { IReportPersistenceGateway, ReportOrder } from "@/server/application/gateway/IReportPersistenceGateway";
import type { IAdSpendResolver } from "@/server/application/service/contracts/IAdSpendResolver";
import type { IFixedCostsGateway } from "@/server/application/gateway/IFixedCostsGateway";
import type { IGetHistoryUseCase, Input, Output } from "./contracts/IGetHistoryUseCase";
import type { HistoryRow } from "@/lib/schemas";

@injectable()
export class GetHistoryUseCase implements IGetHistoryUseCase {
    constructor(
        @inject(SYMBOLS.ReportPersistenceGateway)
        private readonly reportGateway: IReportPersistenceGateway,
        @inject(SYMBOLS.AdSpendResolver)
        private readonly adSpendResolver: IAdSpendResolver,
        @inject(SYMBOLS.FixedCostsGateway)
        private readonly fixedCostsGateway: IFixedCostsGateway,
        @inject(SYMBOLS.PeriodReportCalculator)
        private readonly calculator: PeriodReportCalculator,
    ) {}

    async execute(input: Input): Promise<Output> {
        const period = resolvePeriod(input);
        const [orders, adSpend, fixedCosts] = await Promise.all([
            this.reportGateway.listByPeriod(period),
            this.adSpendResolver.resolve(input),
            this.fixedCostsGateway.get(),
        ]);
        const totalAds = Money.fromCents(adSpend.totalCents);
        const cpa = this.calculator.computeCpa(totalAds, orders.length);
        const periodProfit = this.calculator.computePeriodProfit(orders, totalAds, fixedCosts);
        const rows = orders.map((order) => this.buildRow(order, cpa, fixedCosts));
        return {
            rows,
            summary: {
                orderCount: orders.length,
                revenueCents: periodProfit.revenue.toCents(),
                costCents: periodProfit.cost.toCents(),
                fixedCostTotalCents: periodProfit.fixedCostTotal.toCents(),
                taxCents: periodProfit.tax.toCents(),
                totalAdsCents: totalAds.toCents(),
                profitCents: periodProfit.profit.toCents(),
                avgMarginPct: periodProfit.avgMarginPct,
            },
        };
    }

    private buildRow(order: ReportOrder, cpa: Money, fixedCosts: FixedCosts): HistoryRow {
        const base = {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            recipientName: order.recipientName,
            orderedAt: order.orderedAt.toISOString(),
            saleCents: order.sale.toCents(),
            itemsCostCents: order.itemsCost !== null ? order.itemsCost.toCents() : null,
            cpaCents: cpa.toCents(),
            taxCents: this.calculator.computeTax(order.sale).toCents(),
            fixedCostCents: fixedCosts.totalForOrder(order.itemCount).toCents(),
        };
        if (order.itemsCost === null) {
            return { ...base, netMarginCents: null, netMarginPct: null };
        }
        const margin = this.calculator.computeNetMarginPerOrder(order, cpa, fixedCosts);
        return { ...base, netMarginCents: margin.value.toCents(), netMarginPct: margin.pct };
    }
}
