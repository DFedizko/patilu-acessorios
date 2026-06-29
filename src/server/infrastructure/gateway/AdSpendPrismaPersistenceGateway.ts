import "reflect-metadata";
import { inject, injectable } from "inversify";
import { AdSpendSource } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";
import type { Period } from "@/server/domain/value-object/Period";
import type { IAdSpendPersistenceGateway } from "@/server/application/gateway/IAdSpendPersistenceGateway";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@injectable()
export class AdSpendPrismaPersistenceGateway implements IAdSpendPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async sumManualByPeriod(period: Period): Promise<number> {
        const endExclusive = new Date(period.end.getTime() + ONE_DAY_MS);
        const result = await this.prisma.adSpendDay.aggregate({
            where: { day: { gte: period.start, lt: endExclusive }, source: AdSpendSource.MANUAL },
            _sum: { amountCents: true },
        });
        return result._sum.amountCents ?? 0;
    }

    async upsertDay(day: Date, amountCents: number, source: "TIKTOK" | "MANUAL"): Promise<void> {
        const prismaSource = source === "TIKTOK" ? AdSpendSource.TIKTOK : AdSpendSource.MANUAL;
        await this.prisma.adSpendDay.upsert({
            where: { day },
            create: { day, amountCents, source: prismaSource },
            update: { amountCents, source: prismaSource },
        });
    }
}
