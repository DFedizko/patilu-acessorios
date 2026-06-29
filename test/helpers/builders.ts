import type { Order, Tier } from "@/generated/prisma/client";
import { testPrisma } from "./prisma";

type GivenOrderInput = {
    tiktokOrderId?: string;
    orderNumber?: string;
    recipientName?: string | null;
    saleCents?: number;
    shippingCents?: number;
    orderedAt?: Date;
    shipmentStatus?: "PENDING" | "SHIPPED" | "CANCELLED";
    packingStatus?: "NOT_PACKED" | "PACKED";
};

type GivenTierInput = {
    name?: string;
    costCents?: number;
    barcode?: string;
    categoryId?: string | null;
};

let orderCounter = 0;
let tierCounter = 0;

export const givenOrder = async (input: GivenOrderInput = {}): Promise<Order> => {
    orderCounter += 1;
    return testPrisma.order.create({
        data: {
            tiktokOrderId: input.tiktokOrderId ?? `tiktok-order-${orderCounter}`,
            orderNumber: input.orderNumber ?? `ORD-${orderCounter}`,
            recipientName: input.recipientName ?? null,
            saleCents: input.saleCents ?? 1000,
            shippingCents: input.shippingCents ?? 0,
            orderedAt: input.orderedAt ?? new Date(),
            shipmentStatus: input.shipmentStatus ?? "PENDING",
            packingStatus: input.packingStatus ?? "NOT_PACKED",
        },
    });
};

export const givenTier = async (input: GivenTierInput = {}): Promise<Tier> => {
    tierCounter += 1;
    return testPrisma.tier.create({
        data: {
            name: input.name ?? `Tier ${tierCounter}`,
            costCents: input.costCents ?? 100,
            barcode: input.barcode ?? `T${String(tierCounter).padStart(6, "0")}`,
            categoryId: input.categoryId ?? null,
        },
    });
};
