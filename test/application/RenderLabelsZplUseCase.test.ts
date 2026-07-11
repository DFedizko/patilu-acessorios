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

const LAYOUT: RenderLabelsZplDTO["layout"] = {
    columns: 2,
    labelWidthCm: 5,
    labelHeightCm: 3,
    gapCm: 0.2,
    dpi: 203,
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

    it("lays out the barcodes in rows of N columns with each barcode present", async () => {
        // Arrange
        const pen = await createTier.execute({ name: "Caneta R$1", costReais: 1 });
        const notebook = await createTier.execute({ name: "Caderno R$8", costReais: 8 });

        // Act
        const result = await renderZpl.execute({
            items: [
                { tierId: pen.id, quantity: 3 },
                { tierId: notebook.id, quantity: 2 },
            ],
            layout: LAYOUT,
        });

        // Assert
        expect(result.zpl.match(/\^XA/g)).toHaveLength(3);
        expect(result.zpl.match(/\^FD/g)).toHaveLength(5);
        expect(result.zpl).toContain(`^FD${pen.barcode}^FS`);
        expect(result.zpl).toContain(`^FD${notebook.barcode}^FS`);
        expect(result.zpl).toContain("^PW");
        expect(result.zpl).toContain("^LL");
    });

    it("does not duplicate to fill columns when the count is odd or single", async () => {
        // Arrange
        const pen = await createTier.execute({ name: "Caneta R$1", costReais: 1 });

        // Act
        const single = await renderZpl.execute({
            items: [{ tierId: pen.id, quantity: 1 }],
            layout: LAYOUT,
        });
        const odd = await renderZpl.execute({
            items: [{ tierId: pen.id, quantity: 3 }],
            layout: LAYOUT,
        });

        // Assert
        expect(single.zpl.match(/\^XA/g)).toHaveLength(1);
        expect(single.zpl.match(/\^FD/g)).toHaveLength(1);
        expect(odd.zpl.match(/\^XA/g)).toHaveLength(2);
        expect(odd.zpl.match(/\^FD/g)).toHaveLength(3);
    });

    it("throws TIER_NOT_FOUND when a requested tier id does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await renderZpl.execute({
                items: [{ tierId: "00000000-0000-4000-8000-000000000000", quantity: 1 }],
                layout: LAYOUT,
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
