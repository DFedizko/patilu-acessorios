import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Money } from "@/server/domain/value-object/Money";
import { PeriodReportCalculator } from "@/server/domain/service/PeriodReportCalculator";
import { resolvePeriod } from "@/server/application/resolve-period";
import { SYMBOLS } from "@/server/di/symbols";
import type { IReportPersistenceGateway, ReportOrder } from "@/server/application/gateway/IReportPersistenceGateway";
import type { IGetAdSpendUseCase } from "./contracts/IGetAdSpendUseCase";
import type { IGetFixedCostUseCase } from "./contracts/IGetFixedCostUseCase";
import type { IGetHistoryUseCase, Input, Output } from "./contracts/IGetHistoryUseCase";
import type { HistoryRow } from "@/lib/schemas";

@injectable()
export class GetHistoryUseCase implements IGetHistoryUseCase {
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
        const cpa = this.calculator.computeCpa(totalAds, orders.length);
        const periodProfit = this.calculator.computePeriodProfit(orders, totalAds, fixedCost);
        const rows = orders.map((order) => this.buildRow(order, cpa, fixedCost));
        return {
            rows,
            summary: {
                orderCount: orders.length,
                revenueCents: periodProfit.revenue.toCents(),
                costCents: periodProfit.cost.toCents(),
                totalAdsCents: totalAds.toCents(),
                profitCents: periodProfit.profit.toCents(),
                avgMarginPct: periodProfit.avgMarginPct,
            },
        };
    }

    private buildRow(order: ReportOrder, cpa: Money, fixedCost: Money): HistoryRow {
        const base = {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            recipientName: order.recipientName,
            orderedAt: order.orderedAt.toISOString(),
            saleCents: order.sale.toCents(),
            itemsCostCents: order.itemsCost !== null ? order.itemsCost.toCents() : null,
            cpaCents: cpa.toCents(),
            fixedCostCents: fixedCost.toCents(),
        };
        if (order.itemsCost === null) {
            return { ...base, netMarginCents: null, netMarginPct: null };
        }
        const margin = this.calculator.computeNetMarginPerOrder(order, cpa, fixedCost);
        return { ...base, netMarginCents: margin.value.toCents(), netMarginPct: margin.pct };
    }
}
