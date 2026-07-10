import "reflect-metadata";
import { inject, injectable } from "inversify";
import type {
    Packing as PrismaPacking,
    PackingItem as PrismaPackingItem,
    LooseItem as PrismaLooseItem,
} from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";
import type { IPackingRepository } from "@/server/domain/repository/IPackingRepository";
import { Packing } from "@/server/domain/entity/Packing";
import { PackingItem } from "@/server/domain/entity/PackingItem";
import { LooseItem } from "@/server/domain/entity/LooseItem";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

type PackingWithRelations = PrismaPacking & {
    items: PrismaPackingItem[];
    looseItems: PrismaLooseItem[];
};

@injectable()
export class PackingPrismaRepository implements IPackingRepository {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async save(packing: Packing): Promise<Packing> {
        const savedPacking = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.packing.findUnique({ where: { orderId: packing.getOrderId() } });
            if (existing) {
                await tx.packingItem.deleteMany({ where: { packingId: existing.id } });
                await tx.looseItem.deleteMany({ where: { packingId: existing.id } });
            }
            const record = await tx.packing.upsert({
                where: { orderId: packing.getOrderId() },
                create: {
                    id: packing.getId(),
                    orderId: packing.getOrderId(),
                    operatorId: packing.getOperatorId(),
                    packedAt: packing.getPackedAt(),
                    updatedAt: packing.getUpdatedAt(),
                },
                update: {
                    operatorId: packing.getOperatorId(),
                    updatedAt: packing.getUpdatedAt(),
                },
                include: { items: true, looseItems: true },
            });
            const items = await Promise.all(
                packing.getItems().map((item) =>
                    tx.packingItem.create({
                        data: {
                            id: item.getId(),
                            packingId: record.id,
                            tierId: item.getTierId(),
                            tierName: item.getTierName(),
                            categoryName: item.getCategoryName(),
                            unitCostCents: item.getUnitCostCents(),
                            quantity: item.getQuantity(),
                        },
                    }),
                ),
            );
            const looseItems = await Promise.all(
                packing.getLooseItems().map((item) =>
                    tx.looseItem.create({
                        data: {
                            id: item.id,
                            packingId: record.id,
                            name: item.getName(),
                            costCents: item.getCostCents(),
                        },
                    }),
                ),
            );
            return { ...record, items, looseItems };
        });
        return this.mapToEntity(savedPacking);
    }

    async findByOrderId(orderId: string): Promise<Packing | null> {
        const record = await this.prisma.packing.findUnique({
            where: { orderId },
            include: { items: true, looseItems: true },
        });
        if (!record) return null;
        return this.mapToEntity(record);
    }

    async deleteByOrderId(orderId: string): Promise<void> {
        const record = await this.prisma.packing.findUnique({ where: { orderId } });
        if (!record) throw new NotFoundError(`Packing not found for order: ${orderId}`, "PACKING_NOT_FOUND");
        await this.prisma.packing.delete({ where: { orderId } });
    }

    private mapToEntity(record: PackingWithRelations): Packing {
        return Packing.restore({
            id: record.id,
            orderId: record.orderId,
            operatorId: record.operatorId,
            packedAt: record.packedAt,
            updatedAt: record.updatedAt,
            items: record.items.map((item) =>
                PackingItem.restore({
                    id: item.id,
                    packingId: item.packingId,
                    tierId: item.tierId ?? undefined,
                    tierName: item.tierName,
                    categoryName: item.categoryName,
                    unitCostCents: item.unitCostCents,
                    quantity: item.quantity,
                }),
            ),
            looseItems: record.looseItems.map((item) =>
                LooseItem.restore({
                    id: item.id,
                    packingId: item.packingId,
                    name: item.name,
                    costCents: item.costCents,
                }),
            ),
        });
    }
}
