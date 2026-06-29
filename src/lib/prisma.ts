import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

export const createPrismaClient = (connectionString: string | undefined = process.env.DATABASE_URL): PrismaClient => {
    const isNeon = (connectionString ?? "").includes("neon.tech");
    const adapter = isNeon ? new PrismaNeon({ connectionString }) : new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
};
