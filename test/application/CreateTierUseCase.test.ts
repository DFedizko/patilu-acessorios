import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { CreateCategoryUseCase } from "@/server/application/use-case/CreateCategoryUseCase";
import { DomainError } from "@/server/domain/error/DomainError";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("CreateTierUseCase", () => {
    let createTier: CreateTierUseCase;
    let createCategory: CreateCategoryUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const tierRepo = new TierPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        createCategory = new CreateCategoryUseCase(categoryRepo);
    });

    it("creates a tier with a unique generated barcode", async () => {
        // Arrange — name and cost

        // Act
        const result = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Assert
        expect(result.id).toBeDefined();
        expect(result.name).toBe("Caneta R$1");
        expect(result.costCents).toBe(100);
        expect(result.barcode).toMatch(/^T[A-Za-z0-9_-]{5}$/);
        expect(result.categoryId).toBeNull();
        const saved = await testPrisma.tier.findUnique({ where: { id: result.id } });
        expect(saved).not.toBeNull();
        expect(saved?.barcode).toBe(result.barcode);
    });

    it("creates tier inside a category when categoryId is provided", async () => {
        // Arrange
        const category = await createCategory.execute({ name: "Canetas" });

        // Act
        const result = await createTier.execute({ name: "Caneta R$1", costReais: 1, categoryId: category.id });

        // Assert
        expect(result.categoryId).toBe(category.id);
    });

    it("rejects cost <= 0 with TIER_COST_MUST_BE_POSITIVE", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await createTier.execute({ name: "Caneta", costReais: 0 });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(DomainError);
        expect((thrown as DomainError).code).toBe("TIER_COST_MUST_BE_POSITIVE");
        expect((thrown as DomainError).httpStatus).toBe(422);
    });

    it("retries on barcode collision and persists a unique barcode", async () => {
        // Arrange — create a tier with a known barcode, then force collision on first attempt
        const firstResult = await createTier.execute({ name: "Faixa A", costReais: 2 });
        const usedBarcode = firstResult.barcode;

        let callCount = 0;
        const collidingGenerator = {
            generate: () => {
                callCount++;
                if (callCount === 1) return usedBarcode.slice(1);
                return new BarcodeCodeGenerator().generate();
            },
        };
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const retryingUseCase = new CreateTierUseCase(
            tierRepo,
            categoryRepo,
            collidingGenerator as BarcodeCodeGenerator,
        );

        // Act
        const result = await retryingUseCase.execute({ name: "Faixa B", costReais: 3 });

        // Assert
        expect(result.barcode).not.toBe(usedBarcode);
        expect(callCount).toBeGreaterThanOrEqual(2);
    });

    it("throws CATEGORY_NOT_FOUND when categoryId does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await createTier.execute({
                name: "Caneta",
                costReais: 1,
                categoryId: "00000000-0000-4000-8000-000000000000",
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("CATEGORY_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });
});
