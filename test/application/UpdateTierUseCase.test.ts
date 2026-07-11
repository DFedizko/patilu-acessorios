import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { UpdateTierUseCase } from "@/server/application/use-case/UpdateTierUseCase";
import { CreateCategoryUseCase } from "@/server/application/use-case/CreateCategoryUseCase";
import { DomainError } from "@/server/domain/error/DomainError";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("UpdateTierUseCase", () => {
    let createTier: CreateTierUseCase;
    let updateTier: UpdateTierUseCase;
    let createCategory: CreateCategoryUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        updateTier = new UpdateTierUseCase(tierRepo);
        createCategory = new CreateCategoryUseCase(categoryRepo);
    });

    it("updates name, cost and category of an existing tier", async () => {
        // Arrange
        const category = await createCategory.execute({ name: "Cadernos" });
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Act
        const result = await updateTier.execute({
            id: tier.id,
            name: "Caneta R$2",
            costReais: 2,
            categoryId: category.id,
        });

        // Assert
        expect(result.name).toBe("Caneta R$2");
        expect(result.costCents).toBe(200);
        expect(result.categoryId).toBe(category.id);
        const saved = await testPrisma.tier.findUnique({ where: { id: tier.id } });
        expect(saved?.name).toBe("Caneta R$2");
        expect(saved?.costCents).toBe(200);
    });

    it("throws TIER_NOT_FOUND when tier does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await updateTier.execute({ id: "00000000-0000-4000-8000-000000000000", name: "Qualquer" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });

    it("rejects cost <= 0 with TIER_COST_MUST_BE_POSITIVE", async () => {
        // Arrange
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });
        let thrown: unknown;

        // Act
        try {
            await updateTier.execute({ id: tier.id, costReais: -5 });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(DomainError);
        expect((thrown as DomainError).code).toBe("TIER_COST_MUST_BE_POSITIVE");
        expect((thrown as DomainError).httpStatus).toBe(422);
    });

    it("does not alter past packings (barcode and id remain the same)", async () => {
        // Arrange — barcode is generated once and never changes
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });
        const originalBarcode = tier.barcode;

        // Act
        const result = await updateTier.execute({ id: tier.id, name: "Caneta Atualizada", costReais: 5 });

        // Assert — barcode is immutable (RN-1.2)
        expect(result.barcode).toBe(originalBarcode);
    });
});
