import { describe, it, expect } from "bun:test";
import { FixedCosts } from "@/server/domain/value-object/FixedCosts";
import { Money } from "@/server/domain/value-object/Money";

describe("FixedCosts", () => {
    describe("totalForOrder", () => {
        it("returns zero when there are no fixed costs", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty();

            // Act
            const total = fixedCosts.totalForOrder(5);

            // Assert
            expect(total.toCents()).toBe(0);
        });

        it("charges a PER_ORDER cost once regardless of item count", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty().addFixedCost("Caixa", Money.fromCents(300), "PER_ORDER");

            // Act
            const total = fixedCosts.totalForOrder(10);

            // Assert
            expect(total.toCents()).toBe(300);
        });

        it("multiplies a PER_PRODUCT cost by the item count", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty().addFixedCost("Etiqueta", Money.fromCents(50), "PER_PRODUCT");

            // Act
            const total = fixedCosts.totalForOrder(4);

            // Assert
            expect(total.toCents()).toBe(200);
        });

        it("sums PER_ORDER and PER_PRODUCT costs together", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty()
                .addFixedCost("Caixa", Money.fromCents(300), "PER_ORDER")
                .addFixedCost("Etiqueta", Money.fromCents(50), "PER_PRODUCT");

            // Act
            const total = fixedCosts.totalForOrder(3);

            // Assert
            expect(total.toCents()).toBe(450);
        });

        it("treats a negative item count as zero products", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty()
                .addFixedCost("Caixa", Money.fromCents(300), "PER_ORDER")
                .addFixedCost("Etiqueta", Money.fromCents(50), "PER_PRODUCT");

            // Act
            const total = fixedCosts.totalForOrder(-2);

            // Assert
            expect(total.toCents()).toBe(300);
        });
    });

    describe("addFixedCost", () => {
        it("overwrites an existing cost with the same name (upsert)", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty()
                .addFixedCost("Caixa", Money.fromCents(300), "PER_ORDER")
                .addFixedCost("Caixa", Money.fromCents(500), "PER_ORDER");

            // Act
            const persisted = fixedCosts.toPersistence();

            // Assert
            expect(persisted).toHaveLength(1);
            expect(persisted[0]).toEqual({ name: "Caixa", amountCents: 500, scope: "PER_ORDER" });
        });
    });

    describe("removeFixedCost", () => {
        it("removes a cost by name", () => {
            // Arrange
            const fixedCosts = FixedCosts.empty()
                .addFixedCost("Caixa", Money.fromCents(300), "PER_ORDER")
                .addFixedCost("Etiqueta", Money.fromCents(50), "PER_PRODUCT");

            // Act
            const remaining = fixedCosts.removeFixedCost("Caixa").toPersistence();

            // Assert
            expect(remaining).toEqual([{ name: "Etiqueta", amountCents: 50, scope: "PER_PRODUCT" }]);
        });
    });

    describe("fromPersistence / toPersistence", () => {
        it("round-trips the persisted representation", () => {
            // Arrange
            const persisted = [
                { name: "Caixa", amountCents: 300, scope: "PER_ORDER" as const },
                { name: "Etiqueta", amountCents: 50, scope: "PER_PRODUCT" as const },
            ];

            // Act
            const result = FixedCosts.fromPersistence(persisted).toPersistence();

            // Assert
            expect(result).toEqual(persisted);
        });
    });
});
