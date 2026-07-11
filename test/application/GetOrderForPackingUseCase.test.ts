import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { givenOrder, givenTier } from "../helpers/builders";
import { testPrisma } from "../helpers/prisma";
import { OrderPrismaRepository } from "@/server/infrastructure/repository/OrderPrismaRepository";
import { PackingPrismaRepository } from "@/server/infrastructure/repository/PackingPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { SavePackingUseCase } from "@/server/application/use-case/SavePackingUseCase";
import { GetOrderForPackingUseCase } from "@/server/application/use-case/GetOrderForPackingUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("GetOrderForPackingUseCase", () => {
    let getOrderForPacking: GetOrderForPackingUseCase;
    let savePacking: SavePackingUseCase;

    beforeEach(async () => {
        await truncateAll();
        const orderRepo = new OrderPrismaRepository(testPrisma);
        const packingRepo = new PackingPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        getOrderForPacking = new GetOrderForPackingUseCase(orderRepo, packingRepo);
        savePacking = new SavePackingUseCase(orderRepo, packingRepo, tierRepo, categoryRepo);
    });

    it("returns order and null packing when no packing exists", async () => {
        // Arrange
        const order = await givenOrder();

        // Act
        const result = await getOrderForPacking.execute({ orderId: order.id });

        // Assert
        expect(result.order.id.value).toBe(order.id);
        expect(result.packing).toBeNull();
    });

    it("returns order and packing when packing exists", async () => {
        // Arrange
        const order = await givenOrder();
        const tier = await givenTier();
        await savePacking.execute({
            orderId: order.id,
            operatorId: "operator-1",
            items: [{ tierId: tier.id, quantity: 2 }],
            looseItems: [],
        });

        // Act
        const result = await getOrderForPacking.execute({ orderId: order.id });

        // Assert
        expect(result.order.id.value).toBe(order.id);
        expect(result.packing).not.toBeNull();
        expect(result.packing?.getItems()).toHaveLength(1);
        expect(result.packing?.getItems()[0].getQuantity()).toBe(2);
    });

    it("throws ORDER_NOT_FOUND for a non-existent orderId", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await getOrderForPacking.execute({ orderId: "00000000-0000-4000-8000-000000000000" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("ORDER_NOT_FOUND");
    });
});
