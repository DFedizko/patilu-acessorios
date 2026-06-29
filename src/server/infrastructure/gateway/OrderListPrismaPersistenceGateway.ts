import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { PrismaClient } from "@/generated/prisma/client";
import { SYMBOLS } from "@/server/di/symbols";
import type { Period } from "@/server/domain/value-object/Period";
import type { ShipmentStatus } from "@/server/domain/entity/Order";
import type { IOrderListPersistenceGateway } from "@/server/application/gateway/IOrderListPersistenceGateway";
import type { OrderListItem } from "@/lib/schemas";

const STATUS_ORDER: Record<string, number> = { PENDING: 0, SHIPPED: 1, CANCELLED: 2 };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@injectable()
export class OrderListPrismaPersistenceGateway implements IOrderListPersistenceGateway {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async listByPeriod(period: Period, status?: ShipmentStatus): Promise<OrderListItem[]> {
        const endExclusive = new Date(period.end.getTime() + ONE_DAY_MS);
        const records = await this.prisma.order.findMany({
            where: {
                orderedAt: { gte: period.start, lt: endExclusive },
                ...(status ? { shipmentStatus: status } : {}),
            },
        });
        return records
            .sort((a, b) => {
                const byStatus = (STATUS_ORDER[a.shipmentStatus] ?? 3) - (STATUS_ORDER[b.shipmentStatus] ?? 3);
                if (byStatus !== 0) return byStatus;
                return a.orderedAt.getTime() - b.orderedAt.getTime();
            })
            .map((r) => ({
                orderId: r.id,
                orderNumber: r.orderNumber,
                recipientName: r.recipientName,
                saleCents: r.saleCents,
                shippingCents: r.shippingCents,
                orderedAt: r.orderedAt.toISOString(),
                shipmentStatus: r.shipmentStatus as ShipmentStatus,
                packingStatus: r.packingStatus as "NOT_PACKED" | "PACKED",
            }));
    }
}
