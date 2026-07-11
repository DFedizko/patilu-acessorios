import { Money } from "@/server/domain/value-object/Money";
import type { FixedCosts } from "@/server/domain/value-object/FixedCosts";

export type OrderInPeriod = {
    orderId: string;
    sale: Money;
    shipping: Money;
    itemsCost: Money | null;
    itemCount: number;
    items: { categoryName: string; cost: Money }[];
    orderedAt: Date;
};

const TAX_RATE = 0.042;

const SAO_PAULO_TZ = "America/Sao_Paulo";

const SP_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export type SalesGranularity = "order" | "day";

export class PeriodReportCalculator {
    computeCpa(totalAds: Money, orderCount: number): Money {
        return totalAds.dividedByCount(orderCount);
    }

    computeTax(sale: Money): Money {
        return sale.multiplyByQuantity(TAX_RATE);
    }

    computeNetMarginPerOrder(order: OrderInPeriod, cpa: Money, fixedCosts: FixedCosts): { value: Money; pct: number } {
        const cost = order.itemsCost ?? Money.zero();
        const fixedCost = fixedCosts.totalForOrder(order.itemCount);
        const tax = this.computeTax(order.sale);
        const value = order.sale
            .subtract(cost)
            .subtract(order.shipping)
            .subtract(cpa)
            .subtract(fixedCost)
            .subtract(tax);
        return { value, pct: value.percentageOf(order.sale) };
    }

    computePeriodProfit(
        orders: OrderInPeriod[],
        totalAds: Money,
        fixedCosts: FixedCosts,
    ): { revenue: Money; cost: Money; tax: Money; fixedCostTotal: Money; profit: Money; avgMarginPct: number } {
        const revenue = orders.reduce((acc, o) => acc.add(o.sale), Money.zero());
        const cost = orders.reduce((acc, o) => acc.add(o.itemsCost ?? Money.zero()), Money.zero());
        const totalShipping = orders.reduce((acc, o) => acc.add(o.shipping), Money.zero());
        const tax = orders.reduce((acc, o) => acc.add(this.computeTax(o.sale)), Money.zero());
        const fixedCostTotal = orders.reduce((acc, o) => acc.add(fixedCosts.totalForOrder(o.itemCount)), Money.zero());
        const profit = revenue
            .subtract(cost)
            .subtract(totalShipping)
            .subtract(totalAds)
            .subtract(fixedCostTotal)
            .subtract(tax);
        return { revenue, cost, tax, fixedCostTotal, profit, avgMarginPct: profit.percentageOf(revenue) };
    }

    computeCostByCategory(orders: OrderInPeriod[]): { categoryName: string; cost: Money }[] {
        const map = new Map<string, Money>();
        for (const order of orders) {
            for (const item of order.items) {
                map.set(item.categoryName, (map.get(item.categoryName) ?? Money.zero()).add(item.cost));
            }
        }
        return Array.from(map.entries()).map(([categoryName, cost]) => ({ categoryName, cost }));
    }

    computeSalesSeries(
        orders: OrderInPeriod[],
        granularity: SalesGranularity,
    ): { at: string; saleCents: number; costCents: number }[] {
        if (granularity === "order") {
            return orders
                .slice()
                .sort((a, b) => a.orderedAt.getTime() - b.orderedAt.getTime())
                .map((order) => ({
                    at: order.orderedAt.toISOString(),
                    saleCents: order.sale.toCents(),
                    costCents: (order.itemsCost ?? Money.zero()).toCents(),
                }));
        }
        return this.aggregateByDay(orders);
    }

    private aggregateByDay(orders: OrderInPeriod[]): { at: string; saleCents: number; costCents: number }[] {
        const byDay = new Map<string, { sale: Money; cost: Money }>();
        for (const order of orders) {
            const day = SP_DAY_FORMATTER.format(order.orderedAt);
            const current = byDay.get(day) ?? { sale: Money.zero(), cost: Money.zero() };
            current.sale = current.sale.add(order.sale);
            current.cost = current.cost.add(order.itemsCost ?? Money.zero());
            byDay.set(day, current);
        }
        return Array.from(byDay.entries())
            .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
            .map(([day, totals]) => ({
                at: `${day}T12:00:00.000Z`,
                saleCents: totals.sale.toCents(),
                costCents: totals.cost.toCents(),
            }));
    }
}
