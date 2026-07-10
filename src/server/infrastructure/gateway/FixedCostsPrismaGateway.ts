import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { PrismaClient } from "@/generated/prisma/client";
import { Money } from "@/server/domain/value-object/Money";
import { FixedCosts, type PersistedFixedCost } from "@/server/domain/value-object/FixedCosts";
import { SYMBOLS } from "@/server/di/symbols";
import type { IFixedCostsGateway } from "@/server/application/gateway/IFixedCostsGateway";

const SINGLETON_ID = "singleton";
const DEFAULT_BOX_COST_CENTS = 300;

@injectable()
export class FixedCostsPrismaGateway implements IFixedCostsGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async get(): Promise<FixedCosts> {
        const record = await this.prisma.fixedCosts.findUnique({ where: { id: SINGLETON_ID } });
        if (!record) {
            return this.seed();
        }
        return FixedCosts.fromPersistence(this.parse(record.costs));
    }

    async save(fixedCosts: FixedCosts): Promise<void> {
        const costs = fixedCosts.toPersistence();
        await this.prisma.fixedCosts.upsert({
            where: { id: SINGLETON_ID },
            create: { id: SINGLETON_ID, costs },
            update: { costs },
        });
    }

    private seed(): FixedCosts {
        return FixedCosts.empty()
            .addFixedCost("Caixa", Money.fromCents(DEFAULT_BOX_COST_CENTS), "PER_ORDER")
            .addFixedCost("Etiqueta", Money.zero(), "PER_PRODUCT");
    }

    private parse(costs: unknown): PersistedFixedCost[] {
        if (!Array.isArray(costs)) {
            return [];
        }
        return costs as PersistedFixedCost[];
    }
}
