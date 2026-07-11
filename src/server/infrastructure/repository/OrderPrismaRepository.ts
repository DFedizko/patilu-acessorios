import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { Order as PrismaOrder } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { Order, type ShipmentStatus, type PackingStatus } from "@/server/domain/entity/Order";
import { Money } from "@/server/domain/value-object/Money";
import { SYMBOLS } from "@/server/di/symbols";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

@injectable()
export class OrderPrismaRepository implements IOrderRepository {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async upsert(order: Order): Promise<Order> {
        const record = await this.prisma.order.upsert({
            where: { tiktokOrderId: order.getTiktokOrderId() },
            create: {
                id: order.id.value,
                tiktokOrderId: order.getTiktokOrderId(),
                orderNumber: order.getOrderNumber(),
                recipientName: order.getRecipientName(),
                saleCents: order.getSale().toCents(),
                shippingCents: order.getShipping().toCents(),
                orderedAt: order.getOrderedAt(),
                shipmentStatus: order.getShipmentStatus(),
                packingStatus: order.getPackingStatus(),
            },
            update: {
                orderNumber: order.getOrderNumber(),
                recipientName: order.getRecipientName(),
                saleCents: order.getSale().toCents(),
                shippingCents: order.getShipping().toCents(),
                orderedAt: order.getOrderedAt(),
                shipmentStatus: order.getShipmentStatus(),
            },
        });
        return this.mapToEntity(record);
    }

    async save(order: Order): Promise<Order> {
        const record = await this.prisma.order.update({
            where: { id: order.id.value },
            data: { packingStatus: order.getPackingStatus() },
        });
        return this.mapToEntity(record);
    }

    async findById(id: string): Promise<Order> {
        const record = await this.prisma.order.findUnique({ where: { id } });
        if (!record) throw new NotFoundError(`Order not found: ${id}`, "ORDER_NOT_FOUND");
        return this.mapToEntity(record);
    }

    async findByTiktokOrderId(tiktokOrderId: string): Promise<Order> {
        const record = await this.prisma.order.findUnique({ where: { tiktokOrderId } });
        if (!record) throw new NotFoundError(`Order not found for tiktokOrderId: ${tiktokOrderId}`, "ORDER_NOT_FOUND");
        return this.mapToEntity(record);
    }

    private mapToEntity(record: PrismaOrder): Order {
        return Order.restore({
            id: record.id,
            tiktokOrderId: record.tiktokOrderId,
            orderNumber: record.orderNumber,
            recipientName: record.recipientName,
            saleAmount: Money.fromCents(record.saleCents),
            shippingAmount: Money.fromCents(record.shippingCents),
            orderedAt: record.orderedAt,
            shipmentStatus: record.shipmentStatus as ShipmentStatus,
            packingStatus: record.packingStatus as PackingStatus,
        });
    }
}
