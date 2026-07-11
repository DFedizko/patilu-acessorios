import { describe, expect, it } from "bun:test";
import { Order } from "@/server/domain/entity/Order";
import { Money } from "@/server/domain/value-object/Money";
import { OrderCannotBePackedError } from "@/server/domain/error/OrderCannotBePackedError";

const makeOrder = (overrides: Partial<Parameters<typeof Order.restore>[0]> = {}) =>
    Order.restore({
        id: "00000000-0000-4000-8000-000000000001",
        tiktokOrderId: "TT-001",
        orderNumber: "ORD-001",
        recipientName: "Maria S.",
        saleAmount: Money.fromCents(5000),
        shippingAmount: Money.fromCents(1500),
        orderedAt: new Date("2025-01-01T12:00:00Z"),
        shipmentStatus: "PENDING",
        packingStatus: "NOT_PACKED",
        ...overrides,
    });

describe("Order", () => {
    describe("canBePacked()", () => {
        it("returns true for PENDING orders", () => {
            const order = makeOrder({ shipmentStatus: "PENDING" });
            expect(order.canBePacked()).toBe(true);
        });

        it("returns true for SHIPPED orders", () => {
            const order = makeOrder({ shipmentStatus: "SHIPPED" });
            expect(order.canBePacked()).toBe(true);
        });

        it("returns false for CANCELLED orders", () => {
            const order = makeOrder({ shipmentStatus: "CANCELLED" });
            expect(order.canBePacked()).toBe(false);
        });
    });

    describe("markPacked()", () => {
        it("sets packingStatus to PACKED for a PENDING order", () => {
            const order = makeOrder({ shipmentStatus: "PENDING", packingStatus: "NOT_PACKED" });

            order.markPacked();

            expect(order.getPackingStatus()).toBe("PACKED");
        });

        it("throws OrderCannotBePackedError for a CANCELLED order", () => {
            const order = makeOrder({ shipmentStatus: "CANCELLED" });

            expect(() => order.markPacked()).toThrow(OrderCannotBePackedError);
        });
    });

    describe("markNotPacked()", () => {
        it("sets packingStatus to NOT_PACKED", () => {
            const order = makeOrder({ packingStatus: "PACKED" });

            order.markNotPacked();

            expect(order.getPackingStatus()).toBe("NOT_PACKED");
        });
    });

    describe("applyShipmentStatus()", () => {
        it("updates the shipment status", () => {
            const order = makeOrder({ shipmentStatus: "PENDING" });

            order.applyShipmentStatus("SHIPPED");

            expect(order.getShipmentStatus()).toBe("SHIPPED");
        });
    });

    describe("getSale() / getShipping()", () => {
        it("returns sale and shipping as Money", () => {
            const order = makeOrder({ saleAmount: Money.fromCents(4500), shippingAmount: Money.fromCents(1200) });

            expect(order.getSale().toCents()).toBe(4500);
            expect(order.getShipping().toCents()).toBe(1200);
        });
    });
});
