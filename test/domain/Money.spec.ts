import { describe, expect, it } from "bun:test";
import { Money } from "@/server/domain/value-object/Money";

describe("Money", () => {
    describe("fromCents", () => {
        it("should create Money from integer cents", () => {
            const money = Money.fromCents(150);

            expect(money.toCents()).toBe(150);
        });

        it("should throw when given a non-integer value", () => {
            expect(() => Money.fromCents(1.5)).toThrow();
        });
    });

    describe("fromReais", () => {
        it("should convert reais to cents rounding correctly", () => {
            const money = Money.fromReais(1.99);

            expect(money.toCents()).toBe(199);
        });

        it("should handle floating-point imprecision without error", () => {
            const money = Money.fromReais(0.1 + 0.2);

            expect(money.toCents()).toBe(30);
        });
    });

    describe("zero", () => {
        it("should return zero cents", () => {
            const money = Money.zero();

            expect(money.toCents()).toBe(0);
            expect(money.isPositive()).toBe(false);
        });
    });

    describe("add", () => {
        it("should add two Money values without floating-point error", () => {
            const a = Money.fromCents(100);
            const b = Money.fromCents(50);

            const result = a.add(b);

            expect(result.toCents()).toBe(150);
        });

        it("should add zero without changing the value", () => {
            const a = Money.fromCents(200);

            const result = a.add(Money.zero());

            expect(result.toCents()).toBe(200);
        });
    });

    describe("subtract", () => {
        it("should subtract two Money values correctly", () => {
            const a = Money.fromCents(300);
            const b = Money.fromCents(100);

            const result = a.subtract(b);

            expect(result.toCents()).toBe(200);
        });

        it("should allow negative results", () => {
            const a = Money.fromCents(50);
            const b = Money.fromCents(100);

            const result = a.subtract(b);

            expect(result.toCents()).toBe(-50);
        });
    });

    describe("multiplyByQuantity", () => {
        it("should multiply cents by quantity without floating-point error", () => {
            const unitCost = Money.fromCents(199);

            const result = unitCost.multiplyByQuantity(3);

            expect(result.toCents()).toBe(597);
        });

        it("should return zero when quantity is zero", () => {
            const unitCost = Money.fromCents(500);

            const result = unitCost.multiplyByQuantity(0);

            expect(result.toCents()).toBe(0);
        });
    });

    describe("dividedByCount", () => {
        it("should divide evenly", () => {
            const total = Money.fromCents(300);

            const result = total.dividedByCount(3);

            expect(result.toCents()).toBe(100);
        });

        it("should return zero when count is zero", () => {
            const total = Money.fromCents(1000);

            const result = total.dividedByCount(0);

            expect(result.toCents()).toBe(0);
        });

        it("should round to the nearest cent", () => {
            const total = Money.fromCents(100);

            const result = total.dividedByCount(3);

            expect(result.toCents()).toBe(33);
        });
    });

    describe("percentageOf", () => {
        it("should calculate the correct percentage", () => {
            const profit = Money.fromCents(25);
            const revenue = Money.fromCents(100);

            const result = profit.percentageOf(revenue);

            expect(result).toBeCloseTo(25, 5);
        });

        it("should return zero when total is zero", () => {
            const profit = Money.fromCents(100);

            const result = profit.percentageOf(Money.zero());

            expect(result).toBe(0);
        });

        it("should handle realistic margin calculation", () => {
            const cost = Money.fromCents(600);
            const sale = Money.fromCents(1000);
            const margin = sale.subtract(cost);

            const marginPercent = margin.percentageOf(sale);

            expect(marginPercent).toBeCloseTo(40, 5);
        });
    });

    describe("isPositive", () => {
        it("should return true for positive values", () => {
            expect(Money.fromCents(1).isPositive()).toBe(true);
        });

        it("should return false for zero", () => {
            expect(Money.zero().isPositive()).toBe(false);
        });

        it("should return false for negative values", () => {
            expect(Money.fromCents(-1).isPositive()).toBe(false);
        });
    });

    describe("toDecimalString", () => {
        it("formats cents as a plain two-decimal string with a dot separator", () => {
            expect(Money.fromCents(123456).toDecimalString()).toBe("1234.56");
        });

        it("keeps two decimals for round values", () => {
            expect(Money.fromCents(500).toDecimalString()).toBe("5.00");
        });
    });

    describe("toBRL", () => {
        it("formats cents as Brazilian currency with R$, thousands dot and decimal comma", () => {
            expect(Money.fromCents(123456).toBRL()).toBe("R$ 1.234,56");
        });

        it("formats zero as R$ 0,00", () => {
            expect(Money.zero().toBRL()).toBe("R$ 0,00");
        });
    });
});
