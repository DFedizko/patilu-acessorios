import { describe, it, expect } from "bun:test";
import { PeriodReportCalculator, type OrderInPeriod } from "@/server/domain/service/PeriodReportCalculator";
import { Money } from "@/server/domain/value-object/Money";

const makeOrder = (overrides: Partial<OrderInPeriod> = {}): OrderInPeriod => ({
    orderId: "order-1",
    sale: Money.fromCents(10000),
    shipping: Money.fromCents(1000),
    itemsCost: Money.fromCents(3000),
    items: [],
    orderedAt: new Date("2024-01-01T10:00:00Z"),
    ...overrides,
});

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
            const fixedCost = Money.fromCents(300);

            // Act
            const result = calculator.computeNetMarginPerOrder(order, cpa, fixedCost);

            // Assert — tax = 4.2% of 10000 = 420; 10000 - 3000 - 1000 - 500 - 300 - 420 = 4780
            expect(result.value.toCents()).toBe(4780);
            expect(result.pct).toBeCloseTo(47.8, 1);
        });

        it("treats null itemsCost as zero and still discounts tax", () => {
            // Arrange
            const order = makeOrder({ sale: Money.fromCents(10000), shipping: Money.fromCents(0), itemsCost: null });

            // Act
            const result = calculator.computeNetMarginPerOrder(order, Money.zero(), Money.zero());

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
            const fixedCost = Money.fromCents(300);

            // Act
            const result = calculator.computePeriodProfit(orders, totalAds, fixedCost);

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

    describe("computeMarginSeries", () => {
        it("groups orders by hour for 'hour' granularity", () => {
            // Arrange
            const orders = [
                makeOrder({
                    orderedAt: new Date("2024-01-01T10:00:00Z"),
                    sale: Money.fromCents(10000),
                    shipping: Money.fromCents(0),
                    itemsCost: Money.fromCents(5000),
                }),
                makeOrder({
                    orderedAt: new Date("2024-01-01T10:30:00Z"),
                    sale: Money.fromCents(8000),
                    shipping: Money.fromCents(0),
                    itemsCost: Money.fromCents(4000),
                }),
                makeOrder({
                    orderedAt: new Date("2024-01-01T11:00:00Z"),
                    sale: Money.fromCents(6000),
                    shipping: Money.fromCents(0),
                    itemsCost: Money.fromCents(3000),
                }),
            ];

            // Act
            const result = calculator.computeMarginSeries(orders, "hour");

            // Assert — two hours: 10h (two orders) and 11h (one order), both 50% margin
            expect(result).toHaveLength(2);
            expect(result.every((r) => Math.abs(r.marginPct - 50) < 0.1)).toBe(true);
        });

        it("groups orders by day for 'day' granularity", () => {
            // Arrange
            const orders = [
                makeOrder({ orderedAt: new Date("2024-01-01T10:00:00Z") }),
                makeOrder({ orderedAt: new Date("2024-01-02T10:00:00Z") }),
            ];

            // Act
            const result = calculator.computeMarginSeries(orders, "day");

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]!.label).toBe("2024-01-01");
            expect(result[1]!.label).toBe("2024-01-02");
        });
    });
});
