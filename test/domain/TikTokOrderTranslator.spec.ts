import { describe, expect, it } from "bun:test";
import { TikTokOrderTranslator } from "@/server/domain/acl/TikTokOrderTranslator";
import type { TikTokOrderDTO, TikTokOrderStatus } from "@/server/application/gateway/ITikTokOrdersGateway";

const makeDto = (orderStatus: TikTokOrderStatus): TikTokOrderDTO => ({
    tiktokOrderId: "TT-001",
    orderNumber: "576901234567890",
    recipientName: "Maria S.",
    totalAmountCents: 4500,
    shippingFeeCents: 1500,
    createTime: "2026-07-10T12:00:00.000Z",
    orderStatus,
});

describe("TikTokOrderTranslator", () => {
    const translator = new TikTokOrderTranslator();

    describe("toDomain() shipment status mapping", () => {
        const pendingStatuses: TikTokOrderStatus[] = [
            "UNPAID",
            "ON_HOLD",
            "AWAITING_SHIPMENT",
            "AWAITING_COLLECTION",
            "PARTIALLY_SHIPPING",
        ];

        pendingStatuses.forEach((status) => {
            it(`maps ${status} to PENDING`, () => {
                const order = translator.toDomain(makeDto(status));

                expect(order.getShipmentStatus()).toBe("PENDING");
            });
        });

        const shippedStatuses: TikTokOrderStatus[] = ["IN_TRANSIT", "DELIVERED", "COMPLETED"];

        shippedStatuses.forEach((status) => {
            it(`maps ${status} to SHIPPED`, () => {
                const order = translator.toDomain(makeDto(status));

                expect(order.getShipmentStatus()).toBe("SHIPPED");
            });
        });

        it("maps CANCELLED to CANCELLED", () => {
            const order = translator.toDomain(makeDto("CANCELLED"));

            expect(order.getShipmentStatus()).toBe("CANCELLED");
        });

        it("falls back to PENDING for an unknown status (never silently CANCELLED)", () => {
            const order = translator.toDomain(makeDto("SOMETHING_NEW" as TikTokOrderStatus));

            expect(order.getShipmentStatus()).toBe("PENDING");
        });
    });

    describe("toDTO() reverse status mapping", () => {
        it("maps a SHIPPED order back to IN_TRANSIT", () => {
            const order = translator.toDomain(makeDto("IN_TRANSIT"));

            expect(translator.toDTO(order).orderStatus).toBe("IN_TRANSIT");
        });

        it("maps a CANCELLED order back to CANCELLED", () => {
            const order = translator.toDomain(makeDto("CANCELLED"));

            expect(translator.toDTO(order).orderStatus).toBe("CANCELLED");
        });

        it("maps a PENDING order back to AWAITING_SHIPMENT", () => {
            const order = translator.toDomain(makeDto("UNPAID"));

            expect(translator.toDTO(order).orderStatus).toBe("AWAITING_SHIPMENT");
        });
    });
});
