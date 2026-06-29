import { Money } from "@/server/domain/value-object/Money";
import { OrderCannotBePackedError } from "@/server/domain/error/OrderCannotBePackedError";

export type ShipmentStatus = "PENDING" | "SHIPPED" | "CANCELLED";
export type PackingStatus = "NOT_PACKED" | "PACKED";

type OrderProps = {
    id: string;
    tiktokOrderId: string;
    orderNumber: string;
    recipientName: string | null;
    saleCents: number;
    shippingCents: number;
    orderedAt: Date;
    shipmentStatus: ShipmentStatus;
    packingStatus: PackingStatus;
};

export class Order {
    private readonly id: string;
    private readonly tiktokOrderId: string;
    private readonly orderNumber: string;
    private readonly recipientName: string | null;
    private readonly saleCents: number;
    private readonly shippingCents: number;
    private readonly orderedAt: Date;
    private shipmentStatus: ShipmentStatus;
    private packingStatus: PackingStatus;

    private constructor(props: OrderProps) {
        this.id = props.id;
        this.tiktokOrderId = props.tiktokOrderId;
        this.orderNumber = props.orderNumber;
        this.recipientName = props.recipientName;
        this.saleCents = props.saleCents;
        this.shippingCents = props.shippingCents;
        this.orderedAt = props.orderedAt;
        this.shipmentStatus = props.shipmentStatus;
        this.packingStatus = props.packingStatus;
    }

    static restore(props: OrderProps): Order {
        return new Order(props);
    }

    canBePacked(): boolean {
        return this.shipmentStatus !== "CANCELLED";
    }

    markPacked(): void {
        if (!this.canBePacked()) throw new OrderCannotBePackedError();
        this.packingStatus = "PACKED";
    }

    markNotPacked(): void {
        this.packingStatus = "NOT_PACKED";
    }

    applyShipmentStatus(status: ShipmentStatus): void {
        this.shipmentStatus = status;
    }

    getId(): string {
        return this.id;
    }

    getTiktokOrderId(): string {
        return this.tiktokOrderId;
    }

    getOrderNumber(): string {
        return this.orderNumber;
    }

    getRecipientName(): string | null {
        return this.recipientName;
    }

    getSale(): Money {
        return Money.fromCents(this.saleCents);
    }

    getShipping(): Money {
        return Money.fromCents(this.shippingCents);
    }

    getOrderedAt(): Date {
        return this.orderedAt;
    }

    getShipmentStatus(): ShipmentStatus {
        return this.shipmentStatus;
    }

    getPackingStatus(): PackingStatus {
        return this.packingStatus;
    }
}
