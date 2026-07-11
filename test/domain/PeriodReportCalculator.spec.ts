import { describe, it, expect } from "bun:test";
import { PeriodReportCalculator, type OrderInPeriod } from "@/server/domain/service/PeriodReportCalculator";
import { Money } from "@/server/domain/value-object/Money";
import { FixedCosts } from "@/server/domain/value-object/FixedCosts";

const makeOrder = (overrides: Partial<OrderInPeriod> = {}): OrderInPeriod => ({
    orderId: "order-1",
    sale: Money.fromCents(10000),
    shipping: Money.fromCents(1000),
    itemsCost: Money.fromCents(3000),
    itemCount: 0,
    items: [],
    orderedAt: new Date("2024-01-01T10:00:00Z"),
    ...overrides,
});

const boxCost = (cents: number): FixedCosts =>
    FixedCosts.empty().addFixedCost("Caixa", Money.fromCents(cents), "PER_ORDER");

describe("PeriodReportCalculator", () => {
    const calculator = new PeriodReportCalculator();

    describe("computeCpa", () => {
        it("returns zero when there are no orders", () => {
            // Arrange — totalAds > 0, orderCount = 0

            // Act
            const cpa = calculator.computeCpa(Money.fromCents(50000), 0);

            // Assert
            expect(cpa.toCents()).toBe(0);
        });

        it("divides total ads evenly by order count", () => {
            // Arrange
            const totalAds = Money.fromCents(60000);
            const orderCount = 3;

            // Act
            const cpa = calculator.computeCpa(totalAds, orderCount);

            // Assert
            expect(cpa.toCents()).toBe(20000);
        });
    });

    describe("computeNetMarginPerOrder", () => {
        it("computes margin = sale - itemsCost - shipping - cpa - fixedCost - tax (4.2%)", () => {
            // Arrange
            const order = makeOrder({
                sale: Money.fromCents(10000),
                shipping: Money.fromCents(1000),
                itemsCost: Money.fromCents(3000),
            });
            const cpa = Money.fromCents(500);
            const fixedCosts = boxCost(300);

            // Act
            const result = calculator.computeNetMarginPerOrder(order, cpa, fixedCosts);

            // Assert — tax = 4.2% of 10000 = 420; 10000 - 3000 - 1000 - 500 - 300 - 420 = 4780
            expect(result.value.toCents()).toBe(4780);
            expect(result.pct).toBeCloseTo(47.8, 1);
        });

        it("treats null itemsCost as zero and still discounts tax", () => {
            // Arrange
            const order = makeOrder({ sale: Money.fromCents(10000), shipping: Money.fromCents(0), itemsCost: null });

            // Act
            const result = calculator.computeNetMarginPerOrder(order, Money.zero(), FixedCosts.empty());

            // Assert — tax = 420; 10000 - 420 = 9580
            expect(result.value.toCents()).toBe(9580);
            expect(result.pct).toBeCloseTo(95.8, 1);
        });
    });

    describe("computeTax", () => {
        it("returns 4.2% of the sale value rounded to cents", () => {
            // Arrange
            const sale = Money.fromCents(10000);

            // Act
            const tax = calculator.computeTax(sale);

            // Assert
            expect(tax.toCents()).toBe(420);
        });
    });

    describe("Σ CPA reconciles with total ads", () => {
        it("sum of per-order CPA equals total ads (within rounding tolerance)", () => {
            // Arrange
            const totalAds = Money.fromCents(60000);
            const orderCount = 3;
            const cpa = calculator.computeCpa(totalAds, orderCount);

            // Act
            let sum = Money.zero();
            for (let i = 0; i < orderCount; i++) {
                sum = sum.add(cpa);
            }

            // Assert — allow up to 1 cent per order due to integer rounding
            expect(Math.abs(sum.toCents() - totalAds.toCents())).toBeLessThanOrEqual(orderCount);
        });
    });

    describe("computePeriodProfit", () => {
        it("computes profit = revenue - cost - shipping - totalAds - (fixedCost * orderCount) - tax", () => {
            // Arrange
            const orders = [
                makeOrder({
                    sale: Money.fromCents(10000),
                    shipping: Money.fromCents(1000),
                    itemsCost: Money.fromCents(3000),
                }),
                makeOrder({
                    sale: Money.fromCents(8000),
                    shipping: Money.fromCents(500),
                    itemsCost: Money.fromCents(2000),
                }),
            ];
            const totalAds = Money.fromCents(5000);
            const fixedCosts = boxCost(300);

            // Act
            const result = calculator.computePeriodProfit(orders, totalAds, fixedCosts);

            // Assert
            // revenue = 18000, cost = 5000, shipping = 1500, fixedTotal = 600
            // tax = 4.2% of 10000 + 4.2% of 8000 = 420 + 336 = 756
            // profit = 18000 - 5000 - 1500 - 5000 - 600 - 756 = 5144
            expect(result.revenue.toCents()).toBe(18000);
            expect(result.cost.toCents()).toBe(5000);
            expect(result.tax.toCents()).toBe(756);
            expect(result.profit.toCents()).toBe(5144);
        });
    });

    describe("computeCostByCategory", () => {
        it("groups item costs by category name across orders", () => {
            // Arrange
            const orders = [
                makeOrder({
                    items: [
                        { categoryName: "Canetas", cost: Money.fromCents(100) },
                        { categoryName: "Cadernos", cost: Money.fromCents(800) },
                    ],
                }),
                makeOrder({
                    items: [{ categoryName: "Canetas", cost: Money.fromCents(200) }],
                }),
            ];

            // Act
            const result = calculator.computeCostByCategory(orders);

            // Assert
            const canetas = result.find((r) => r.categoryName === "Canetas");
            const cadernos = result.find((r) => r.categoryName === "Cadernos");
            expect(canetas?.cost.toCents()).toBe(300);
            expect(cadernos?.cost.toCents()).toBe(800);
        });
    });

    describe("computeSalesSeries", () => {
        it("emits one point per order with sale and cost cents, sorted ascending by orderedAt (granularity 'order')", () => {
            // Arrange — deliberately out of order
            const orders = [
                makeOrder({
                    orderedAt: new Date("2024-01-01T11:00:00Z"),
                    sale: Money.fromCents(6000),
                    itemsCost: Money.fromCents(3000),
                }),
                makeOrder({
                    orderedAt: new Date("2024-01-01T10:00:00Z"),
                    sale: Money.fromCents(10000),
                    itemsCost: Money.fromCents(5000),
                }),
            ];

            // Act
            const result = calculator.computeSalesSeries(orders, "order");

            // Assert — one point per order, earliest first
            expect(result).toHaveLength(2);
            expect(result[0]!.at).toBe("2024-01-01T10:00:00.000Z");
            expect(result[0]!.saleCents).toBe(10000);
            expect(result[0]!.costCents).toBe(5000);
            expect(result[1]!.saleCents).toBe(6000);
        });

        it("treats a missing itemsCost as zero cost", () => {
            // Arrange
            const orders = [makeOrder({ itemsCost: null, sale: Money.fromCents(4000) })];

            // Act
            const result = calculator.computeSalesSeries(orders, "order");

            // Assert
            expect(result[0]!.costCents).toBe(0);
        });

        it("aggregates sale and cost totals per São Paulo day (granularity 'day')", () => {
            // Arrange — three orders across two SP days (first crosses the UTC/SP boundary)
            const orders = [
                makeOrder({
                    orderedAt: new Date("2024-01-02T01:00:00Z"), // 2024-01-01 22:00 SP
                    sale: Money.fromCents(1000),
                    itemsCost: Money.fromCents(400),
                }),
                makeOrder({
                    orderedAt: new Date("2024-01-01T15:00:00Z"), // 2024-01-01 12:00 SP
                    sale: Money.fromCents(2000),
                    itemsCost: Money.fromCents(600),
                }),
                makeOrder({
                    orderedAt: new Date("2024-01-02T15:00:00Z"), // 2024-01-02 12:00 SP
                    sale: Money.fromCents(5000),
                    itemsCost: null,
                }),
            ];

            // Act
            const result = calculator.computeSalesSeries(orders, "day");

            // Assert — one point per SP day, summed, sorted ascending
            expect(result).toHaveLength(2);
            expect(result[0]!.at).toBe("2024-01-01T12:00:00.000Z");
            expect(result[0]!.saleCents).toBe(3000);
            expect(result[0]!.costCents).toBe(1000);
            expect(result[1]!.at).toBe("2024-01-02T12:00:00.000Z");
            expect(result[1]!.saleCents).toBe(5000);
            expect(result[1]!.costCents).toBe(0);
        });
    });
});
