import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { testPrisma } from "../helpers/prisma";
import { TierPrismaRepository } from "@/server/infrastructure/repository/TierPrismaRepository";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import { CreateTierUseCase } from "@/server/application/use-case/CreateTierUseCase";
import { ZplLabelRenderer } from "@/server/infrastructure/gateway/ZplLabelRenderer";
import { RenderLabelsZplUseCase } from "@/server/application/use-case/RenderLabelsZplUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";
import type { RenderLabelsZplDTO } from "@/lib/schemas";

const OPTIONS: RenderLabelsZplDTO["options"] = {
    heightDots: 100,
    moduleWidthDots: 2,
    originXDots: 30,
    originYDots: 30,
    printHumanReadable: true,
};

describe("RenderLabelsZplUseCase", () => {
    let createTier: CreateTierUseCase;
    let renderZpl: RenderLabelsZplUseCase;

    beforeEach(async () => {
        await truncateAll();
        const tierRepo = new TierPrismaRepository(testPrisma);
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        const barcodeGenerator = new BarcodeCodeGenerator();
        createTier = new CreateTierUseCase(tierRepo, categoryRepo, barcodeGenerator);
        renderZpl = new RenderLabelsZplUseCase(tierRepo, new ZplLabelRenderer());
    });

    it("builds one ZPL block per tier carrying its barcode and requested quantity", async () => {
        // Arrange
        const pen = await createTier.execute({ name: "Caneta R$1", costReais: 1 });
        const notebook = await createTier.execute({ name: "Caderno R$8", costReais: 8 });

        // Act
        const result = await renderZpl.execute({
            items: [
                { tierId: pen.id, quantity: 3 },
                { tierId: notebook.id, quantity: 2 },
            ],
            options: OPTIONS,
        });

        // Assert
        expect(result.zpl.match(/\^XA/g)).toHaveLength(2);
        expect(result.zpl).toContain(`^FD${pen.barcode}^FS`);
        expect(result.zpl).toContain(`^FD${notebook.barcode}^FS`);
        expect(result.zpl).toContain("^PQ3,0,0,N");
        expect(result.zpl).toContain("^PQ2,0,0,N");
    });

    it("throws TIER_NOT_FOUND when a requested tier id does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await renderZpl.execute({
                items: [{ tierId: "00000000-0000-4000-8000-000000000000", quantity: 1 }],
                options: OPTIONS,
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("TIER_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });
});
