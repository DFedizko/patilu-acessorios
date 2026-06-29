import type { ITikTokOrdersGateway, TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";
import type { Period } from "@/server/domain/value-object/Period";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

const FAKE_ORDERS: TikTokOrderDTO[] = [
    {
        tiktokOrderId: "TT-20250001",
        orderNumber: "576901234567890",
        recipientName: "Maria S.",
        totalAmountCents: 4500,
        shippingFeeCents: 1500,
        createTime: daysAgo(0),
        orderStatus: "AWAITING_SHIPMENT",
    },
    {
        tiktokOrderId: "TT-20250002",
        orderNumber: "576901234567891",
        recipientName: "João P.",
        totalAmountCents: 3000,
        shippingFeeCents: 0,
        createTime: daysAgo(1),
        orderStatus: "AWAITING_SHIPMENT",
    },
    {
        tiktokOrderId: "TT-20250003",
        orderNumber: "576901234567892",
        recipientName: "Ana L.",
        totalAmountCents: 6000,
        shippingFeeCents: 2000,
        createTime: daysAgo(3),
        orderStatus: "AWAITING_COLLECTION",
    },
    {
        tiktokOrderId: "TT-20250004",
        orderNumber: "576901234567893",
        recipientName: "Carlos M.",
        totalAmountCents: 2500,
        shippingFeeCents: 1200,
        createTime: daysAgo(5),
        orderStatus: "IN_TRANSIT",
    },
    {
        tiktokOrderId: "TT-20250005",
        orderNumber: "576901234567894",
        recipientName: "Fernanda R.",
        totalAmountCents: 4000,
        shippingFeeCents: 1500,
        createTime: daysAgo(7),
        orderStatus: "CANCELLED",
    },
];

export class FakeTikTokOrdersGateway implements ITikTokOrdersGateway {
    async searchOrders(period: Period): Promise<TikTokOrderDTO[]> {
        const endExclusive = new Date(period.end.getTime() + ONE_DAY_MS);
        return FAKE_ORDERS.filter((o) => {
            const created = new Date(o.createTime);
            return created >= period.start && created < endExclusive;
        });
    }

    async getOrder(tiktokOrderId: string): Promise<TikTokOrderDTO> {
        const order = FAKE_ORDERS.find((o) => o.tiktokOrderId === tiktokOrderId);
        if (!order) throw new NotFoundError(`Order not found for tiktokOrderId: ${tiktokOrderId}`, "ORDER_NOT_FOUND");
        return order;
    }
}
