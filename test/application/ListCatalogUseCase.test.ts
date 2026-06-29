import { describe, it, expect, beforeEach } from "bun:test";
import { truncateAll } from "../helpers/truncate";
import { givenTier } from "../helpers/builders";
import { testPrisma } from "../helpers/prisma";
import { CatalogReadPrismaPersistenceGateway } from "@/server/infrastructure/gateway/CatalogReadPrismaPersistenceGateway";
import { ListCatalogUseCase } from "@/server/application/use-case/ListCatalogUseCase";

describe("ListCatalogUseCase", () => {
    let listCatalog: ListCatalogUseCase;

    beforeEach(async () => {
        await truncateAll();
        const catalogGateway = new CatalogReadPrismaPersistenceGateway(testPrisma);
        listCatalog = new ListCatalogUseCase(catalogGateway);
    });

    it("returns categories with their tiers plus the 'Sem categoria' group", async () => {
        // Arrange
        const canetas = await testPrisma.category.create({ data: { name: "Canetas" } });
        const cadernos = await testPrisma.category.create({ data: { name: "Cadernos" } });
        const caneta = await givenTier({ name: "Caneta R$1", categoryId: canetas.id });
        const caderno = await givenTier({ name: "Caderno R$8", categoryId: cadernos.id });
        const avulso = await givenTier({ name: "Item avulso", categoryId: null });

        // Act
        const result = await listCatalog.execute();

        // Assert
        const canetasGroup = result.find((group) => group.id === canetas.id);
        const cadernosGroup = result.find((group) => group.id === cadernos.id);
        const uncategorizedGroup = result.find((group) => group.id === null);
        expect(canetasGroup?.name).toBe("Canetas");
        expect(canetasGroup?.tiers.map((tier) => tier.id)).toEqual([caneta.id]);
        expect(cadernosGroup?.name).toBe("Cadernos");
        expect(cadernosGroup?.tiers.map((tier) => tier.id)).toEqual([caderno.id]);
        expect(uncategorizedGroup?.name).toBe("Sem categoria");
        expect(uncategorizedGroup?.tiers.map((tier) => tier.id)).toEqual([avulso.id]);
    });
});
