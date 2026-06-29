import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";
import type { IConfigPersistenceGateway } from "@/server/application/gateway/IConfigPersistenceGateway";

const SINGLETON_ID = "singleton";
const DEFAULT_FIXED_COST_CENTS = 300;

@injectable()
export class ConfigPrismaPersistenceGateway implements IConfigPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async getFixedCostPerOrderCents(): Promise<number> {
        const config = await this.prisma.appConfig.findUnique({ where: { id: SINGLETON_ID } });
        return config?.fixedCostPerOrderCents ?? DEFAULT_FIXED_COST_CENTS;
    }

    async setFixedCostPerOrderCents(cents: number): Promise<void> {
        await this.prisma.appConfig.upsert({
            where: { id: SINGLETON_ID },
            create: { id: SINGLETON_ID, fixedCostPerOrderCents: cents },
            update: { fixedCostPerOrderCents: cents },
        });
    }
}
