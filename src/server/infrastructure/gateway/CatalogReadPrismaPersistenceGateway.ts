import "reflect-metadata";
import { inject, injectable } from "inversify";
import type {
    ICatalogReadPersistenceGateway,
    CategoryWithTiers,
    TierReadModel,
} from "@/server/application/gateway/ICatalogReadPersistenceGateway";
import type { Prisma, Tier as PrismaTier } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";

const UNCATEGORIZED_NAME = "Sem categoria";

@injectable()
export class CatalogReadPrismaPersistenceGateway implements ICatalogReadPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async listCatalog(search?: string): Promise<CategoryWithTiers[]> {
        const term = search?.trim();
        if (!term) return this.listAll();
        return this.listMatching(term);
    }

    private async listAll(): Promise<CategoryWithTiers[]> {
        const categories = await this.prisma.category.findMany({
            include: { tiers: { orderBy: { createdAt: "asc" } } },
            orderBy: { createdAt: "asc" },
        });
        const uncategorizedTiers = await this.prisma.tier.findMany({
            where: { categoryId: null },
            orderBy: { createdAt: "asc" },
        });
        const result: CategoryWithTiers[] = categories.map((category) => ({
            id: category.id,
            name: category.name,
            tiers: category.tiers.map((tier) => this.mapTier(tier)),
        }));
        result.push({
            id: null,
            name: UNCATEGORIZED_NAME,
            tiers: uncategorizedTiers.map((tier) => this.mapTier(tier)),
        });
        return result;
    }

    private async listMatching(term: string): Promise<CategoryWithTiers[]> {
        const contains: Prisma.StringFilter = { contains: term, mode: "insensitive" };
        const categories = await this.prisma.category.findMany({
            where: { OR: [{ name: contains }, { tiers: { some: { name: contains } } }] },
            include: { tiers: { orderBy: { createdAt: "asc" } } },
            orderBy: { createdAt: "asc" },
        });
        const uncategorizedTiers = await this.prisma.tier.findMany({
            where: { categoryId: null, name: contains },
            orderBy: { createdAt: "asc" },
        });
        const result: CategoryWithTiers[] = categories.map((category) => {
            const tiers = this.matches(category.name, term)
                ? category.tiers
                : category.tiers.filter((tier) => this.matches(tier.name, term));
            return { id: category.id, name: category.name, tiers: tiers.map((tier) => this.mapTier(tier)) };
        });
        if (uncategorizedTiers.length > 0) {
            result.push({
                id: null,
                name: UNCATEGORIZED_NAME,
                tiers: uncategorizedTiers.map((tier) => this.mapTier(tier)),
            });
        }
        return result;
    }

    private matches(value: string, term: string): boolean {
        return value.toLowerCase().includes(term.toLowerCase());
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
