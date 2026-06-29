import "reflect-metadata";
import { inject, injectable } from "inversify";
import type {
    ICatalogReadPersistenceGateway,
    CategoryWithTiers,
    TierReadModel,
} from "@/server/application/gateway/ICatalogReadPersistenceGateway";
import type { Tier as PrismaTier } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";

@injectable()
export class CatalogReadPrismaPersistenceGateway implements ICatalogReadPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async listCatalog(): Promise<CategoryWithTiers[]> {
        const categories = await this.prisma.category.findMany({
            include: { tiers: { orderBy: { name: "asc" } } },
            orderBy: { name: "asc" },
        });
        const uncategorizedTiers = await this.prisma.tier.findMany({
            where: { categoryId: null },
            orderBy: { name: "asc" },
        });
        const result: CategoryWithTiers[] = categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            tiers: cat.tiers.map((t) => this.mapTier(t)),
        }));
        result.push({
            id: null,
            name: "Sem categoria",
            tiers: uncategorizedTiers.map((t) => this.mapTier(t)),
        });
        return result;
    }

    private mapTier(tier: PrismaTier): TierReadModel {
        return {
            id: tier.id,
            name: tier.name,
            costCents: tier.costCents,
            barcode: tier.barcode,
            categoryId: tier.categoryId,
        };
    }
}
