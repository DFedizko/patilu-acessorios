import { testPrisma } from "./prisma";

const TABLES = [
    "packing_items",
    "loose_items",
    "packings",
    "orders",
    "tiers",
    "categories",
    "ad_spend_days",
    "fixed_costs",
] as const;

export const truncateAll = async (): Promise<void> => {
    for (const table of TABLES) {
        await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
    }
};
