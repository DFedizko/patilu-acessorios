import type { Period } from "@/server/domain/value-object/Period";

export type TikTokOrderStatus =
    | "UNPAID"
    | "ON_HOLD"
    | "AWAITING_SHIPMENT"
    | "AWAITING_COLLECTION"
    | "PARTIALLY_SHIPPING"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";

export type TikTokOrderDTO = {
    tiktokOrderId: string;
    orderNumber: string;
    recipientName: string | null;
    totalAmountCents: number;
    shippingFeeCents: number;
    createTime: string;
    orderStatus: TikTokOrderStatus;
};

export interface ITikTokOrdersGateway {
    searchOrders(period: Period): Promise<TikTokOrderDTO[]>;
    getOrder(tiktokOrderId: string): Promise<TikTokOrderDTO>;
}
