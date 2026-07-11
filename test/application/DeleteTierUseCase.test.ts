import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { DeleteTierUseCase } from "@/server/application/use-case/DeleteTierUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("DeleteTierUseCase", () => {
    let createTier: CreateTierUseCase;
    let deleteTier: DeleteTierUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        deleteTier = new DeleteTierUseCase(tierRepo);
    });

    it("deletes an existing tier", async () => {
        // Arrange
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Act
        await deleteTier.execute({ id: tier.id });

        // Assert
        const deleted = await testPrisma.tier.findUnique({ where: { id: tier.id } });
        expect(deleted).toBeNull();
    });

    it("throws TIER_NOT_FOUND when tier does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await deleteTier.execute({ id: "00000000-0000-4000-8000-000000000000" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });

    it("does not break past packings (snapshot model is unaffected)", async () => {
        // Arrange — create a tier and simulate a packing snapshot referencing it via packing_items
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });
        const order = await testPrisma.order.create({
            data: {
                tiktokOrderId: "tiktok-order-del-test",
                orderNumber: "ORD-DEL",
                saleCents: 1000,
                shippingCents: 0,
                orderedAt: new Date(),
                shipmentStatus: "PENDING",
                packingStatus: "NOT_PACKED",
            },
        });
        const packing = await testPrisma.packing.create({
            data: {
                orderId: order.id,
                operatorId: "test-operator",
            },
        });
        await testPrisma.packingItem.create({
            data: {
                packingId: packing.id,
                tierId: tier.id,
                tierName: tier.name,
                categoryName: "Sem categoria",
                unitCostCents: tier.costCents,
                quantity: 1,
            },
        });

        // Act
        await deleteTier.execute({ id: tier.id });

        // Assert — packing_item snapshot is intact (PRD RN-3.5)
        const packingItem = await testPrisma.packingItem.findFirst({ where: { packingId: packing.id } });
        expect(packingItem).not.toBeNull();
        expect(packingItem?.tierName).toBe(tier.name);
        expect(packingItem?.unitCostCents).toBe(tier.costCents);
    });
});
