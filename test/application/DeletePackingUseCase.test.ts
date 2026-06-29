import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { givenOrder, givenTier } from "../helpers/builders";
import { testPrisma } from "../helpers/prisma";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { PackingPrismaRepository } from "@/server/infrastructure/repository/PackingPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { SavePackingUseCase } from "@/server/application/use-case/SavePackingUseCase";
import { DeletePackingUseCase } from "@/server/application/use-case/DeletePackingUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("DeletePackingUseCase", () => {
    let deletePacking: DeletePackingUseCase;
    let savePacking: SavePackingUseCase;
    let orderRepo: OrderPrismaRepository;

    beforeEach(async () => {
        await truncateAll();
        orderRepo = new OrderPrismaRepository(testPrisma);
        const packingRepo = new PackingPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        deletePacking = new DeletePackingUseCase(orderRepo, packingRepo);
        savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
    });

    it("deletes packing and marks order as NOT_PACKED", async () => {
        // Arrange
        const order = await givenOrder();
        const tier = await givenTier();
        await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 1 }],
            looseItems: [],
        });
        const packedOrder = await orderRepo.findById(order.id);
        expect(packedOrder.getPackingStatus()).toBe("PACKED");

        // Act
        await deletePacking.execute({ orderId: order.id });

        // Assert
        const unpackedOrder = await orderRepo.findById(order.id);
        expect(unpackedOrder.getPackingStatus()).toBe("NOT_PACKED");
        const deletedPacking = await testPrisma.packing.findUnique({ where: { orderId: order.id } });
        expect(deletedPacking).toBeNull();
    });

    it("throws PACKING_NOT_FOUND when no packing exists", async () => {
        // Arrange
        const order = await givenOrder();
        let thrown: unknown;

        // Act
        try {
            await deletePacking.execute({ orderId: order.id });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("PACKING_NOT_FOUND");
    });
});
