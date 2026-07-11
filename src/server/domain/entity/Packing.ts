import { Money } from "@/server/domain/value-object/Money";
import { PackingItem } from "@/server/domain/entity/PackingItem";
import { LooseItem } from "@/server/domain/entity/LooseItem";
import { PackingRequiresItemError } from "@/server/domain/error/PackingRequiresItemError";
import { UUID } from "@/server/domain/value-object/UUID";
import { Entity } from "./Entity";

type AddTierSnapshot = {
    tierId: string;
    tierName: string;
    categoryName: string;
    unitCostAmount: Money;
};

type RestoreProps = {
    id: string;
    orderId: string;
    operatorId: string;
    packedAt: Date;
    updatedAt: Date;
    items: PackingItem[];
    looseItems: LooseItem[];
};

type PackingProps = {
    orderId: string;
    operatorId: string;
    packedAt: Date;
    updatedAt: Date;
    items: PackingItem[];
    looseItems: LooseItem[];
};

export class Packing extends Entity<PackingProps, UUID> {
    private constructor(
        protected readonly props: PackingProps,
        id?: UUID,
    ) {
        super(props, id);
    }

    static create(orderId: string, operatorId: string): Packing {
        const now = new Date();
        return new Packing({ orderId, operatorId, packedAt: now, updatedAt: now, items: [], looseItems: [] });
    }

    static restore(props: RestoreProps): Packing {
        return new Packing(
            {
                orderId: props.orderId,
                operatorId: props.operatorId,
                packedAt: props.packedAt,
                updatedAt: props.updatedAt,
                items: props.items,
                looseItems: props.looseItems,
            },
            UUID.restore(props.id),
        );
    }

    addTier(snapshot: AddTierSnapshot): void {
        const existing = this.props.items.find((item) => item.getTierId() === snapshot.tierId);
        if (existing) {
            existing.increment();
            return;
        }
        this.props.items.push(
            PackingItem.create({
                tierId: snapshot.tierId,
                tierName: snapshot.tierName,
                categoryName: snapshot.categoryName,
                unitCostAmount: snapshot.unitCostAmount,
            }),
        );
    }

    incrementTier(tierId: string): void {
        const item = this.props.items.find((i) => i.getTierId() === tierId);
        if (item) item.increment();
    }

    decrementTier(tierId: string): void {
        const item = this.props.items.find((i) => i.getTierId() === tierId);
        if (!item) return;
        const newQty = item.decrement();
        if (newQty <= 0) {
            const index = this.props.items.indexOf(item);
            this.props.items.splice(index, 1);
        }
    }

    addLooseItem(name: string, cost: Money): void {
        this.props.looseItems.push(LooseItem.create({ name, costAmount: cost }));
    }

    removeLooseItem(looseItemId: string): void {
        const index = this.props.looseItems.findIndex((i) => i.id.value === looseItemId);
        if (index !== -1) this.props.looseItems.splice(index, 1);
    }

    computeItemsCost(): Money {
        const itemsCost = this.props.items.reduce((acc, item) => acc.add(item.getTotalCost()), Money.zero());
        return this.props.looseItems.reduce((acc, item) => acc.add(item.getCost()), itemsCost);
    }

    computeLiveMargin(sale: Money, shipping: Money): { marginValue: Money; marginPct: number } {
        const cost = this.computeItemsCost();
        const marginValue = sale.subtract(cost).subtract(shipping);
        const marginPct = marginValue.percentageOf(sale);
        return { marginValue, marginPct };
    }

    ensureCanConclude(): void {
        if (this.props.items.length + this.props.looseItems.length === 0) throw new PackingRequiresItemError();
    }

    getOrderId(): string {
        return this.props.orderId;
    }

    getOperatorId(): string {
        return this.props.operatorId;
    }

    getPackedAt(): Date {
        return this.props.packedAt;
    }

    getUpdatedAt(): Date {
        return this.props.updatedAt;
    }

    getItems(): PackingItem[] {
        return this.props.items;
    }

    getLooseItems(): LooseItem[] {
        return this.props.looseItems;
    }
}
