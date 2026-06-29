import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { FindTierByBarcodeUseCase } from "@/server/application/use-case/FindTierByBarcodeUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("FindTierByBarcodeUseCase", () => {
    let createTier: CreateTierUseCase;
    let findByBarcode: FindTierByBarcodeUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        findByBarcode = new FindTierByBarcodeUseCase(tierRepo);
    });

    it("resolves a barcode to the correct tier", async () => {
        // Arrange
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Act
        const result = await findByBarcode.execute({ barcode: tier.barcode });

        // Assert
        expect(result.id).toBe(tier.id);
        expect(result.name).toBe(tier.name);
        expect(result.costCents).toBe(tier.costCents);
        expect(result.barcode).toBe(tier.barcode);
    });

    it("throws TIER_NOT_FOUND for an unknown barcode", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await findByBarcode.execute({ barcode: "TUNKNOWNCODE" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });
});
