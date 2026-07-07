import { Money } from "@/server/domain/value-object/Money";

export type OrderInPeriod = {
    orderId: string;
    sale: Money;
    shipping: Money;
    itemsCost: Money | null;
    items: { categoryName: string; cost: Money }[];
    orderedAt: Date;
};

const pad = (n: number): string => n.toString().padStart(2, "0");

const TAX_RATE = 0.042;

export class PeriodReportCalculator {
    computeCpa(totalAds: Money, orderCount: number): Money {
        return totalAds.dividedByCount(orderCount);
    }

    computeTax(sale: Money): Money {
        return sale.multiplyByQuantity(TAX_RATE);
    }

    computeNetMarginPerOrder(order: OrderInPeriod, cpa: Money, fixedCost: Money): { value: Money; pct: number } {
        const cost = order.itemsCost ?? Money.zero();
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
        fixedCost: Money,
    ): { revenue: Money; cost: Money; tax: Money; profit: Money; avgMarginPct: number } {
        const revenue = orders.reduce((acc, o) => acc.add(o.sale), Money.zero());
        const cost = orders.reduce((acc, o) => acc.add(o.itemsCost ?? Money.zero()), Money.zero());
        const totalShipping = orders.reduce((acc, o) => acc.add(o.shipping), Money.zero());
        const tax = orders.reduce((acc, o) => acc.add(this.computeTax(o.sale)), Money.zero());
        const fixedCostTotal = fixedCost.multiplyByQuantity(orders.length);
        const profit = revenue
            .subtract(cost)
            .subtract(totalShipping)
            .subtract(totalAds)
            .subtract(fixedCostTotal)
            .subtract(tax);
        return { revenue, cost, tax, profit, avgMarginPct: profit.percentageOf(revenue) };
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

    computeMarginSeries(orders: OrderInPeriod[], granularity: "hour" | "day"): { label: string; marginPct: number }[] {
        const buckets = new Map<string, { sale: Money; cost: Money; shipping: Money }>();
        for (const order of orders) {
            const label = this.bucketLabel(order.orderedAt, granularity);
            const current = buckets.get(label) ?? { sale: Money.zero(), cost: Money.zero(), shipping: Money.zero() };
            buckets.set(label, {
                sale: current.sale.add(order.sale),
                cost: current.cost.add(order.itemsCost ?? Money.zero()),
                shipping: current.shipping.add(order.shipping),
            });
        }
        return Array.from(buckets.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, { sale, cost, shipping }]) => ({
                label,
                marginPct: sale.subtract(cost).subtract(shipping).percentageOf(sale),
            }));
    }

    private bucketLabel(date: Date, granularity: "hour" | "day"): string {
        const y = pad(date.getUTCFullYear());
        const m = pad(date.getUTCMonth() + 1);
        const d = pad(date.getUTCDate());
        if (granularity === "hour") {
            return `${y}-${m}-${d} ${pad(date.getUTCHours())}h`;
        }
        return `${y}-${m}-${d}`;
    }
}
