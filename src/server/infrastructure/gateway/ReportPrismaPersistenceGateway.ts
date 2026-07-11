import "reflect-metadata";
import { inject, injectable } from "inversify";
import { Money } from "@/server/domain/value-object/Money";
import { SYMBOLS } from "@/server/di/symbols";
import type { Period } from "@/server/domain/value-object/Period";
import type { IReportPersistenceGateway, ReportOrder } from "@/server/application/gateway/IReportPersistenceGateway";
import type { Order, Packing, PackingItem, LooseItem, PrismaClient } from "@/generated/prisma/client";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type OrderWithPacking = Order & {
    packing: (Packing & { items: PackingItem[]; looseItems: LooseItem[] }) | null;
};

@injectable()
export class ReportPrismaPersistenceGateway implements IReportPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async listByPeriod(period: Period): Promise<ReportOrder[]> {
        const endExclusive = new Date(period.end.getTime() + ONE_DAY_MS);
        const records = await this.prisma.order.findMany({
            where: {
                orderedAt: { gte: period.start, lt: endExclusive },
                shipmentStatus: { not: "CANCELLED" },
            },
            include: { packing: { include: { items: true, looseItems: true } } },
            orderBy: { orderedAt: "asc" },
        });
        return records.map((r) => this.mapToReportOrder(r));
    }

    private mapToReportOrder(record: OrderWithPacking): ReportOrder {
        const base = {
            orderId: record.id,
            orderNumber: record.orderNumber,
            recipientName: record.recipientName,
            sale: Money.fromCents(record.saleCents),
            shipping: Money.fromCents(record.shippingCents),
            orderedAt: record.orderedAt,
        };
        if (!record.packing) {
            return { ...base, itemsCost: null, itemCount: 0, items: [] };
        }
        const items = record.packing.items.map((item) => ({
            categoryName: item.categoryName,
            cost: Money.fromCents(item.unitCostCents * item.quantity),
        }));
        const tierCost = items.reduce((acc, item) => acc.add(item.cost), Money.zero());
        const looseCost = record.packing.looseItems.reduce(
            (acc, item) => acc.add(Money.fromCents(item.costCents)),
            Money.zero(),
        );
        const itemsCost = tierCost.add(looseCost);
        const tierUnitCount = record.packing.items.reduce((acc, item) => acc + item.quantity, 0);
        const itemCount = tierUnitCount + record.packing.looseItems.length;
        return { ...base, itemsCost, itemCount, items };
    }
}
