import { Order, type ShipmentStatus } from "@/server/domain/entity/Order";
import type { TikTokOrderDTO, TikTokOrderStatus } from "@/server/application/gateway/ITikTokOrdersGateway";

const PENDING_STATUSES = new Set<TikTokOrderStatus>([
    "UNPAID",
    "AWAITING_SHIPMENT",
    "AWAITING_COLLECTION",
    "PARTIALLY_SHIPPING",
]);

const SHIPPED_STATUSES = new Set<TikTokOrderStatus>(["IN_TRANSIT", "DELIVERED", "COMPLETED"]);

const mapToShipmentStatus = (status: TikTokOrderStatus): ShipmentStatus => {
    if (PENDING_STATUSES.has(status)) return "PENDING";
    if (SHIPPED_STATUSES.has(status)) return "SHIPPED";
    return "CANCELLED";
};

export class TikTokOrderTranslator {
    toDomain(dto: TikTokOrderDTO): Order {
        return Order.restore({
            id: crypto.randomUUID(),
            tiktokOrderId: dto.tiktokOrderId,
            orderNumber: dto.orderNumber,
            recipientName: dto.recipientName,
            saleCents: dto.totalAmountCents,
            shippingCents: dto.shippingFeeCents,
            orderedAt: new Date(dto.createTime),
            shipmentStatus: mapToShipmentStatus(dto.orderStatus),
            packingStatus: "NOT_PACKED",
        });
    }

    toDTO(order: Order): TikTokOrderDTO {
        return {
            tiktokOrderId: order.getTiktokOrderId(),
            orderNumber: order.getOrderNumber(),
            recipientName: order.getRecipientName(),
            totalAmountCents: order.getSale().toCents(),
            shippingFeeCents: order.getShipping().toCents(),
            createTime: order.getOrderedAt().toISOString(),
            orderStatus: this.reverseMapStatus(order.getShipmentStatus()),
        };
    }

    private reverseMapStatus(status: ShipmentStatus): TikTokOrderStatus {
        if (status === "SHIPPED") return "IN_TRANSIT";
        if (status === "CANCELLED") return "CANCELLED";
        return "AWAITING_SHIPMENT";
    }
}
