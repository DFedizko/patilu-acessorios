import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { RenderTierLabelUseCase } from "@/server/application/use-case/RenderTierLabelUseCase";
import { FakeBarcodeRenderer } from "../fakes/FakeBarcodeRenderer";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("RenderTierLabelUseCase", () => {
    let createTier: CreateTierUseCase;
    let renderLabel: RenderTierLabelUseCase;

    beforeEach(async () => {
        await truncateAll();
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        const barcodeRenderer = new FakeBarcodeRenderer();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        renderLabel = new RenderTierLabelUseCase(tierRepo, barcodeRenderer);
    });

    it("returns an SVG string for an existing tier", async () => {
        // Arrange
        const tier = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Act
        const result = await renderLabel.execute({ id: tier.id });

        // Assert
        expect(result.svg).toContain(tier.barcode);
        expect(result.svg).toContain("<svg>");
    });

    it("throws TIER_NOT_FOUND for a non-existent tier", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await renderLabel.execute({ id: "00000000-0000-4000-8000-000000000000" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });
});
