import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { Tier as PrismaTier } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { Tier } from "@/server/domain/entity/Tier";
import { SYMBOLS } from "@/server/di/symbols";
import { DomainError } from "@/server/domain/error/DomainError";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import { Barcode } from "@/server/domain/value-object/Barcode";
import { Money } from "@/server/domain/value-object/Money";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

@injectable()
export class TierPrismaRepository implements ITierRepository {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async findById(id: string): Promise<Tier> {
        const record = await this.prisma.tier.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundError(`Tier not found: ${id}`, "TIER_NOT_FOUND");
        }
        return this.mapToEntity(record);
    }

    async findByIds(ids: string[]): Promise<Tier[]> {
        const uniqueIds = [...new Set(ids)];
        const records = await this.prisma.tier.findMany({ where: { id: { in: uniqueIds } } });
        if (records.length !== uniqueIds.length) {
            const foundIds = new Set(records.map((record) => record.id));
            const missingId = uniqueIds.find((id) => !foundIds.has(id));
            throw new NotFoundError(`Tier not found: ${missingId}`, "TIER_NOT_FOUND");
        }
        return records.map((record) => this.mapToEntity(record));
    }

    async findByBarcode(barcode: string): Promise<Tier> {
        const record = await this.prisma.tier.findUnique({ where: { barcode } });
        if (!record) {
            throw new NotFoundError(`Tier not found for barcode: ${barcode}`, "TIER_NOT_FOUND");
        }
        return this.mapToEntity(record);
    }

    async findAll(): Promise<Tier[]> {
        const records = await this.prisma.tier.findMany({ orderBy: { name: "asc" } });
        return records.map((r) => this.mapToEntity(r));
    }

    async findByCategoryId(categoryId: string): Promise<Tier[]> {
        const records = await this.prisma.tier.findMany({ where: { categoryId }, orderBy: { name: "asc" } });
        return records.map((r) => this.mapToEntity(r));
    }

    async save(tier: Tier): Promise<void> {
        try {
            await this.prisma.tier.upsert({
                where: { id: tier.id.value },
                create: {
                    id: tier.id.value,
                    name: tier.getName(),
                    costCents: tier.getCost().toCents(),
                    barcode: tier.getBarcode().toString(),
                    categoryId: tier.getCategoryId(),
                    createdAt: tier.getCreatedAt(),
                },
                update: {
                    name: tier.getName(),
                    costCents: tier.getCost().toCents(),
                    barcode: tier.getBarcode().toString(),
                    categoryId: tier.getCategoryId(),
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new DomainError("DUPLICATE_BARCODE", 422, "Barcode already exists");
            }
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        const record = await this.prisma.tier.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundError(`Tier not found: ${id}`, "TIER_NOT_FOUND");
        }
        await this.prisma.tier.delete({ where: { id } });
    }

    private mapToEntity(record: PrismaTier): Tier {
        return Tier.restore({
            id: record.id,
            name: record.name,
            cost: Money.fromCents(record.costCents),
            barcode: Barcode.fromString(record.barcode),
            categoryId: record.categoryId,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
}
