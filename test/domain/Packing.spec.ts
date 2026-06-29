import { describe, expect, it } from "bun:test";
import { Packing } from "@/server/domain/entity/Packing";
import { PackingItem } from "@/server/domain/entity/PackingItem";
import { LooseItem } from "@/server/domain/entity/LooseItem";
import { Money } from "@/server/domain/value-object/Money";
import { PackingRequiresItemError } from "@/server/domain/error/PackingRequiresItemError";

const makePacking = () => Packing.create("order-1", "operator-1");

const makeTierSnapshot = (overrides: Partial<Parameters<Packing["addTier"]>[0]> = {}) => ({
    tierId: "tier-1",
    tierName: "Caneta R$1",
    categoryName: "Canetas",
    unitCostCents: 100,
    ...overrides,
});

describe("Packing", () => {
    describe("addTier()", () => {
        it("creates a new item with quantity=1 when tier is added for the first time", () => {
            const packing = makePacking();

            packing.addTier(makeTierSnapshot());

            expect(packing.getItems()).toHaveLength(1);
            expect(packing.getItems()[0].getQuantity()).toBe(1);
            expect(packing.getItems()[0].getTierId()).toBe("tier-1");
        });

        it("increments quantity when same tierId is added again", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot());

            packing.addTier(makeTierSnapshot());

            expect(packing.getItems()).toHaveLength(1);
            expect(packing.getItems()[0].getQuantity()).toBe(2);
        });

        it("creates separate items for different tiers", () => {
            const packing = makePacking();

            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));
            packing.addTier(makeTierSnapshot({ tierId: "tier-2", tierName: "Caderno R$8" }));

            expect(packing.getItems()).toHaveLength(2);
        });
    });

    describe("incrementTier()", () => {
        it("increments quantity of an existing item", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));

            packing.incrementTier("tier-1");

            expect(packing.getItems()[0].getQuantity()).toBe(2);
        });

        it("does nothing when tier does not exist", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));

            packing.incrementTier("tier-999");

            expect(packing.getItems()[0].getQuantity()).toBe(1);
        });
    });

    describe("decrementTier()", () => {
        it("decrements quantity of an existing item", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));

            packing.decrementTier("tier-1");

            expect(packing.getItems()[0].getQuantity()).toBe(1);
        });

        it("removes the item when quantity reaches 0", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));

            packing.decrementTier("tier-1");

            expect(packing.getItems()).toHaveLength(0);
        });

        it("does nothing when tier does not exist", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));

            packing.decrementTier("tier-999");

            expect(packing.getItems()).toHaveLength(1);
        });
    });

    describe("addLooseItem() / removeLooseItem()", () => {
        it("adds a loose item", () => {
            const packing = makePacking();

            packing.addLooseItem("Fita adesiva", Money.fromReais(2.5));

            expect(packing.getLooseItems()).toHaveLength(1);
            expect(packing.getLooseItems()[0].getName()).toBe("Fita adesiva");
            expect(packing.getLooseItems()[0].getCostCents()).toBe(250);
        });

        it("removes a loose item by id", () => {
            const packing = makePacking();
            packing.addLooseItem("Fita adesiva", Money.fromReais(2.5));
            const looseItemId = packing.getLooseItems()[0].getId();

            packing.removeLooseItem(looseItemId);

            expect(packing.getLooseItems()).toHaveLength(0);
        });

        it("does nothing when removing a non-existent loose item id", () => {
            const packing = makePacking();
            packing.addLooseItem("Fita adesiva", Money.fromReais(2.5));

            packing.removeLooseItem("non-existent-id");

            expect(packing.getLooseItems()).toHaveLength(1);
        });
    });

    describe("computeItemsCost()", () => {
        it("returns zero when packing is empty", () => {
            const packing = makePacking();

            expect(packing.computeItemsCost().toCents()).toBe(0);
        });

        it("sums tier items cost", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ tierId: "tier-1", unitCostCents: 100 }));
            packing.addTier(makeTierSnapshot({ tierId: "tier-1" }));
            packing.addTier(makeTierSnapshot({ tierId: "tier-2", unitCostCents: 800 }));

            expect(packing.computeItemsCost().toCents()).toBe(1000);
        });

        it("includes loose items in the cost sum", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ unitCostCents: 100 }));
            packing.addLooseItem("Extra", Money.fromReais(1.5));

            expect(packing.computeItemsCost().toCents()).toBe(250);
        });
    });

    describe("computeLiveMargin()", () => {
        it("computes correct margin value and percentage", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ unitCostCents: 500 }));
            const sale = Money.fromReais(20);
            const shipping = Money.fromReais(5);

            const { marginValue, marginPct } = packing.computeLiveMargin(sale, shipping);

            expect(marginValue.toCents()).toBe(1000);
            expect(marginPct).toBeCloseTo(50, 1);
        });

        it("returns negative margin when cost exceeds sale minus shipping", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot({ unitCostCents: 2000 }));
            const sale = Money.fromReais(10);
            const shipping = Money.fromReais(5);

            const { marginValue } = packing.computeLiveMargin(sale, shipping);

            expect(marginValue.toCents()).toBeLessThan(0);
        });
    });

    describe("ensureCanConclude()", () => {
        it("throws PackingRequiresItemError when packing has no items", () => {
            const packing = makePacking();

            expect(() => packing.ensureCanConclude()).toThrow(PackingRequiresItemError);
        });

        it("passes when packing has tier items", () => {
            const packing = makePacking();
            packing.addTier(makeTierSnapshot());

            expect(() => packing.ensureCanConclude()).not.toThrow();
        });

        it("passes when packing has only loose items", () => {
            const packing = makePacking();
            packing.addLooseItem("Item avulso", Money.fromReais(1));

            expect(() => packing.ensureCanConclude()).not.toThrow();
        });
    });

    describe("restore()", () => {
        it("restores a packing with items and loose items", () => {
            const item = PackingItem.restore({
                id: "item-1",
                packingId: "packing-1",
                tierId: "tier-1",
                tierName: "Caneta",
                categoryName: "Canetas",
                unitCostCents: 100,
                quantity: 2,
            });
            const looseItem = LooseItem.restore({
                id: "loose-1",
                packingId: "packing-1",
                name: "Fita",
                costCents: 200,
            });

            const packing = Packing.restore({
                id: "packing-1",
                orderId: "order-1",
                operatorId: "op-1",
                packedAt: new Date("2025-01-01"),
                updatedAt: new Date("2025-01-01"),
                items: [item],
                looseItems: [looseItem],
            });

            expect(packing.getId()).toBe("packing-1");
            expect(packing.getItems()).toHaveLength(1);
            expect(packing.getLooseItems()).toHaveLength(1);
            expect(packing.computeItemsCost().toCents()).toBe(400);
        });
    });
});
