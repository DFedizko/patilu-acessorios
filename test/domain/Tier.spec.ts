import { describe, expect, it } from "bun:test";
import { Tier } from "@/server/domain/entity/Tier";
import { DomainError } from "@/server/domain/error/DomainError";
import { TierCostMustBePositiveError } from "@/server/domain/error/TierCostMustBePositiveError";
import { Barcode } from "@/server/domain/value-object/Barcode";
import { Money } from "@/server/domain/value-object/Money";

const makeBarcode = () => Barcode.fromNanoid("abc123");
const makePositiveCost = () => Money.fromCents(100);

describe("Tier", () => {
    describe("create", () => {
        it("creates a tier with valid props", () => {
            const tier = Tier.create({
                name: "Caneta R$1",
                cost: makePositiveCost(),
                barcode: makeBarcode(),
                categoryId: null,
            });

            expect(tier.getName()).toBe("Caneta R$1");
            expect(tier.getCost().toCents()).toBe(100);
            expect(tier.getCategoryId()).toBeNull();
            expect(tier.getId()).toBeTruthy();
        });

        it("throws DomainError TIER_NAME_REQUIRED when name is empty", () => {
            expect(() => Tier.create({ name: "", cost: makePositiveCost(), barcode: makeBarcode() })).toThrow(
                DomainError,
            );
        });

        it("throws TierCostMustBePositiveError when cost is zero", () => {
            expect(() => Tier.create({ name: "Caneta R$1", cost: Money.zero(), barcode: makeBarcode() })).toThrow(
                TierCostMustBePositiveError,
            );
        });

        it("throws TierCostMustBePositiveError when cost is negative", () => {
            expect(() =>
                Tier.create({ name: "Caneta R$1", cost: Money.fromCents(-50), barcode: makeBarcode() }),
            ).toThrow(TierCostMustBePositiveError);
        });
    });

    describe("rename", () => {
        it("renames the tier to a valid name", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            tier.rename("Caderno R$8");

            expect(tier.getName()).toBe("Caderno R$8");
        });

        it("throws DomainError TIER_NAME_REQUIRED when renaming to empty name", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            expect(() => tier.rename("")).toThrow(DomainError);
        });
    });

    describe("changeCost", () => {
        it("changes the cost to a positive value", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            tier.changeCost(Money.fromCents(200));

            expect(tier.getCost().toCents()).toBe(200);
        });

        it("throws TierCostMustBePositiveError when new cost is zero", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            expect(() => tier.changeCost(Money.zero())).toThrow(TierCostMustBePositiveError);
        });

        it("throws TierCostMustBePositiveError when new cost is negative", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            expect(() => tier.changeCost(Money.fromCents(-1))).toThrow(TierCostMustBePositiveError);
        });
    });

    describe("assignToCategory / moveToUncategorized", () => {
        it("assigns a tier to a category", () => {
            const tier = Tier.create({ name: "Caneta R$1", cost: makePositiveCost(), barcode: makeBarcode() });

            tier.assignToCategory("category-id-1");

            expect(tier.getCategoryId()).toBe("category-id-1");
        });

        it("moves the tier to uncategorized (null categoryId)", () => {
            const tier = Tier.create({
                name: "Caneta R$1",
                cost: makePositiveCost(),
                barcode: makeBarcode(),
                categoryId: "category-id-1",
            });

            tier.moveToUncategorized();

            expect(tier.getCategoryId()).toBeNull();
        });

        it("can reassign a tier to a different category", () => {
            const tier = Tier.create({
                name: "Caneta R$1",
                cost: makePositiveCost(),
                barcode: makeBarcode(),
                categoryId: "category-id-1",
            });

            tier.assignToCategory("category-id-2");

            expect(tier.getCategoryId()).toBe("category-id-2");
        });
    });
});
