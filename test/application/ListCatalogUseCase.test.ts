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
        const result = await listCatalog.execute({});

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

    it("orders categories and their tiers by creation date (oldest first)", async () => {
        // Arrange
        const later = await testPrisma.category.create({ data: { name: "Zebra", createdAt: new Date("2026-02-01") } });
        const earlier = await testPrisma.category.create({
            data: { name: "Abacaxi", createdAt: new Date("2026-01-01") },
        });
        const secondTier = await givenTier({ name: "Segunda", categoryId: earlier.id });
        const firstTier = await givenTier({ name: "Primeira", categoryId: earlier.id });
        await testPrisma.tier.update({ where: { id: secondTier.id }, data: { createdAt: new Date("2026-01-20") } });
        await testPrisma.tier.update({ where: { id: firstTier.id }, data: { createdAt: new Date("2026-01-10") } });

        // Act
        const result = await listCatalog.execute({});

        // Assert
        expect(result.slice(0, 2).map((group) => group.name)).toEqual(["Abacaxi", "Zebra"]);
        const earlierGroup = result.find((group) => group.id === earlier.id);
        expect(earlierGroup?.tiers.map((tier) => tier.id)).toEqual([firstTier.id, secondTier.id]);
        expect(later.name).toBe("Zebra");
    });

    it("filters by an approximate term matching either category or tier name", async () => {
        // Arrange
        const canetas = await testPrisma.category.create({ data: { name: "Canetas" } });
        const cadernos = await testPrisma.category.create({ data: { name: "Cadernos" } });
        await givenTier({ name: "Clique", categoryId: canetas.id });
        await givenTier({ name: "Premium", categoryId: canetas.id });
        const premiumCaderno = await givenTier({ name: "Premium", categoryId: cadernos.id });

        // Act
        const byTier = await listCatalog.execute({ search: "prem" });
        const byCategory = await listCatalog.execute({ search: "canet" });

        // Assert
        const canetasInByTier = byTier.find((group) => group.id === canetas.id);
        const cadernosInByTier = byTier.find((group) => group.id === cadernos.id);
        expect(canetasInByTier?.tiers.map((tier) => tier.name)).toEqual(["Premium"]);
        expect(cadernosInByTier?.tiers.map((tier) => tier.id)).toEqual([premiumCaderno.id]);
        expect(byCategory.map((group) => group.id)).toEqual([canetas.id]);
        expect(byCategory[0]?.tiers.map((tier) => tier.name)).toEqual(["Clique", "Premium"]);
    });
});
