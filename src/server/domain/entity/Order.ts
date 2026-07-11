import { Money } from "@/server/domain/value-object/Money";
import { UUID } from "@/server/domain/value-object/UUID";
import { OrderCannotBePackedError } from "@/server/domain/error/OrderCannotBePackedError";
import { Entity } from "./Entity";

export type ShipmentStatus = "PENDING" | "SHIPPED" | "CANCELLED";
export type PackingStatus = "NOT_PACKED" | "PACKED";

type RestoreProps = {
    id: string;
    tiktokOrderId: string;
    orderNumber: string;
    recipientName: string | null;
    saleAmount: Money;
    shippingAmount: Money;
    orderedAt: Date;
    shipmentStatus: ShipmentStatus;
    packingStatus: PackingStatus;
};

type CreateProps = Omit<RestoreProps, "id">;

type OrderProps = CreateProps;

export class Order extends Entity<OrderProps, UUID> {
    private constructor(
        protected readonly props: OrderProps,
        id?: UUID,
    ) {
        super(props, id);
    }

    static create(props: CreateProps): Order {
        return new Order(props);
    }

    static restore(props: RestoreProps): Order {
        return new Order(
            {
                tiktokOrderId: props.tiktokOrderId,
                orderNumber: props.orderNumber,
                recipientName: props.recipientName,
                saleAmount: props.saleAmount,
                shippingAmount: props.shippingAmount,
                orderedAt: props.orderedAt,
                shipmentStatus: props.shipmentStatus,
                packingStatus: props.packingStatus,
            },
            UUID.restore(props.id),
        );
    }

    canBePacked(): boolean {
        return this.props.shipmentStatus !== "CANCELLED";
    }

    markPacked(): void {
        if (!this.canBePacked()) throw new OrderCannotBePackedError();
        this.props.packingStatus = "PACKED";
    }

    markNotPacked(): void {
        this.props.packingStatus = "NOT_PACKED";
    }

    applyShipmentStatus(status: ShipmentStatus): void {
        this.props.shipmentStatus = status;
    }

    getTiktokOrderId(): string {
        return this.props.tiktokOrderId;
    }

    getOrderNumber(): string {
        return this.props.orderNumber;
    }

    getRecipientName(): string | null {
        return this.props.recipientName;
    }

    getSale(): Money {
        return this.props.saleAmount;
    }

    getShipping(): Money {
        return this.props.shippingAmount;
    }

    getOrderedAt(): Date {
        return this.props.orderedAt;
    }

    getShipmentStatus(): ShipmentStatus {
        return this.props.shipmentStatus;
    }

    getPackingStatus(): PackingStatus {
        return this.props.packingStatus;
    }
}
