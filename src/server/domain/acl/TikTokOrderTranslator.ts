import { Order, type ShipmentStatus } from "@/server/domain/entity/Order";
import { Money } from "@/server/domain/value-object/Money";
import type { TikTokOrderDTO, TikTokOrderStatus } from "@/server/application/gateway/ITikTokOrdersGateway";
import { Translator } from "@/server/domain/acl/Translator";

const SHIPPED_STATUSES = new Set<TikTokOrderStatus>(["IN_TRANSIT", "DELIVERED", "COMPLETED"]);

const CANCELLED_STATUSES = new Set<TikTokOrderStatus>(["CANCELLED"]);

export class TikTokOrderTranslator implements Translator<TikTokOrderDTO> {
    toDomain(dto: TikTokOrderDTO): Order {
        return Order.create({
            tiktokOrderId: dto.tiktokOrderId,
            orderNumber: dto.orderNumber,
            recipientName: dto.recipientName,
            saleAmount: Money.fromCents(dto.totalAmountCents),
            shippingAmount: Money.fromCents(dto.shippingFeeCents),
            orderedAt: new Date(dto.createTime),
            shipmentStatus: this.mapToShipmentStatus(dto.orderStatus),
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

    private mapToShipmentStatus = (status: TikTokOrderStatus): ShipmentStatus => {
        if (SHIPPED_STATUSES.has(status)) return "SHIPPED";
        if (CANCELLED_STATUSES.has(status)) return "CANCELLED";
        return "PENDING";
    };
}
