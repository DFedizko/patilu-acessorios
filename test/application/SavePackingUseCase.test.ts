import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { givenOrder, givenTier } from "../helpers/builders";
import { testPrisma } from "../helpers/prisma";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { PackingPrismaRepository } from "@/server/infrastructure/repository/PackingPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { SavePackingUseCase } from "@/server/application/use-case/SavePackingUseCase";
import { OrderCannotBePackedError } from "@/server/domain/error/OrderCannotBePackedError";
import { PackingRequiresItemError } from "@/server/domain/error/PackingRequiresItemError";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("SavePackingUseCase", () => {
    let savePacking: SavePackingUseCase;
    let orderRepo: OrderPrismaRepository;
    let packingRepo: PackingPrismaRepository;

    beforeEach(async () => {
        await truncateAll();
        orderRepo = new OrderPrismaRepository(testPrisma);
        packingRepo = new PackingPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
    });

    it("saves packing with tier items and sets order to PACKED", async () => {
        // Arrange
        const order = await givenOrder({ saleCents: 2000, shippingCents: 500 });
        const tier = await givenTier({ costCents: 100 });

        // Act
        const packing = await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 3 }],
            looseItems: [],
        });

        // Assert
        expect(packing.id).toBeDefined();
        expect(packing.getItems()).toHaveLength(1);
        expect(packing.getItems()[0].getQuantity()).toBe(3);
        expect(packing.getItems()[0].getUnitCost().toCents()).toBe(100);
        const savedOrder = await orderRepo.findById(order.id);
        expect(savedOrder.getPackingStatus()).toBe("PACKED");
        const savedPacking = await testPrisma.packing.findUnique({
            where: { orderId: order.id },
            include: { items: true },
        });
        expect(savedPacking).not.toBeNull();
        expect(savedPacking?.items).toHaveLength(1);
        expect(savedPacking?.items[0].quantity).toBe(3);
    });

    it("records the given operatorId on the saved packing", async () => {
        // Arrange
        const order = await givenOrder();
        const tier = await givenTier();

        // Act
        const packing = await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-42",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Assert
        expect(packing.getOperatorId()).toBe("operator-42");
        const savedPacking = await testPrisma.packing.findUnique({ where: { orderId: order.id } });
        expect(savedPacking?.operatorId).toBe("operator-42");
    });

    it("freezes the cost snapshot so later tier changes do not affect the packing", async () => {
        // Arrange
        const order = await givenOrder();
        const category = await testPrisma.category.create({ data: { id: crypto.randomUUID(), name: "Canetas" } });
        const tier = await givenTier({ name: "Caneta R$1", costCents: 100, categoryId: category.id });

        // Act
        await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });
        await testPrisma.tier.update({ where: { id: tier.id }, data: { costCents: 999, name: "Caneta cara" } });
        await testPrisma.category.update({ where: { id: category.id }, data: { name: "Renomeada" } });
        const reloaded = await packingRepo.findByOrderId(order.id);

        // Assert
        expect(reloaded).not.toBeNull();
        expect(reloaded?.getItems()[0].getUnitCost().toCents()).toBe(100);
        expect(reloaded?.getItems()[0].getTierName()).toBe("Caneta R$1");
        expect(reloaded?.getItems()[0].getCategoryName()).toBe("Canetas");
    });

    it("rewrites the snapshot when the same order is packed again", async () => {
        // Arrange
        const order = await givenOrder();
        const firstTier = await givenTier({ name: "Caneta", costCents: 100 });
        const secondTier = await givenTier({ name: "Caderno", costCents: 800 });
        await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: firstTier.id, quantity: 3 }],
            looseItems: [{ name: "Fita", costReais: 1 }],
        });

        // Act
        await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-2",
            items: [{ tierId: secondTier.id, quantity: 1 }],
            looseItems: [],
        });
        const reloaded = await packingRepo.findByOrderId(order.id);

        // Assert
        expect(reloaded).not.toBeNull();
        expect(reloaded?.getOperatorId()).toBe("operator-2");
        expect(reloaded?.getItems()).toHaveLength(1);
        expect(reloaded?.getItems()[0].getTierId()).toBe(secondTier.id);
        expect(reloaded?.getItems()[0].getQuantity()).toBe(1);
        expect(reloaded?.getItems()[0].getUnitCost().toCents()).toBe(800);
        expect(reloaded?.getLooseItems()).toHaveLength(0);
        const savedPacking = await testPrisma.packing.findUnique({
            where: { orderId: order.id },
            include: { items: true, looseItems: true },
        });
        expect(savedPacking?.items).toHaveLength(1);
        expect(savedPacking?.looseItems).toHaveLength(0);
    });

    it("saves packing with loose items", async () => {
        // Arrange
        const order = await givenOrder();

        // Act
        const packing = await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [],
            looseItems: [{ name: "Fita adesiva", costReais: 2.5 }],
        });

        // Assert
        expect(packing.getLooseItems()).toHaveLength(1);
        expect(packing.getLooseItems()[0].getName()).toBe("Fita adesiva");
        expect(packing.getLooseItems()[0].getCost().toCents()).toBe(250);
        const savedPacking = await testPrisma.packing.findUnique({
            where: { orderId: order.id },
            include: { looseItems: true },
        });
        expect(savedPacking?.looseItems).toHaveLength(1);
    });

    it("sets categoryName from tier category when tier has a category", async () => {
        // Arrange
        const order = await givenOrder();
        const category = await testPrisma.category.create({ data: { id: crypto.randomUUID(), name: "Canetas" } });
        const tier = await givenTier({ categoryId: category.id });

        // Act
        const packing = await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Assert
        expect(packing.getItems()[0].getCategoryName()).toBe("Canetas");
    });

    it("sets categoryName to Sem categoria when tier has no category", async () => {
        // Arrange
        const order = await givenOrder();
        const tier = await givenTier({ categoryId: null });

        // Act
        const packing = await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });

        // Assert
        expect(packing.getItems()[0].getCategoryName()).toBe("Sem categoria");
    });

    it("throws OrderCannotBePackedError for cancelled order", async () => {
        // Arrange
        const order = await givenOrder({ shipmentStatus: "CANCELLED" });
        const tier = await givenTier();
        let thrown: unknown;

        // Act
        try {
            await savePacking.execute({
                orderId: order.id,
                operatorId: "operator-1",
                items: [{ tierId: tier.id, quantity: 1 }],
                looseItems: [],
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(OrderCannotBePackedError);
        expect((thrown as OrderCannotBePackedError).code).toBe("ORDER_CANNOT_BE_PACKED");
    });

    it("throws PackingRequiresItemError when no items and no loose items", async () => {
        // Arrange
        const order = await givenOrder();
        let thrown: unknown;

        // Act
        try {
            await savePacking.execute({
                orderId: order.id,
                operatorId: "operator-1",
                items: [],
                looseItems: [],
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(PackingRequiresItemError);
        expect((thrown as PackingRequiresItemError).code).toBe("PACKING_REQUIRES_ITEM");
    });

    it("throws TIER_NOT_FOUND for invalid tierId", async () => {
        // Arrange
        const order = await givenOrder();
        let thrown: unknown;

        // Act
        try {
            await savePacking.execute({
                orderId: order.id,
                operatorId: "operator-1",
                items: [{ tierId: "00000000-0000-4000-8000-000000000000", quantity: 1 }],
                looseItems: [],
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
    });
});
