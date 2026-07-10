import { Money } from "@/server/domain/value-object/Money";
import { PackingItem } from "@/server/domain/entity/PackingItem";
import { LooseItem } from "@/server/domain/entity/LooseItem";
import { PackingRequiresItemError } from "@/server/domain/error/PackingRequiresItemError";

type AddTierSnapshot = {
    tierId: string;
    tierName: string;
    categoryName: string;
    unitCostCents: number;
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

export class Packing {
    private constructor(
        private readonly id: string,
        private readonly orderId: string,
        private readonly operatorId: string,
        private readonly packedAt: Date,
        private readonly updatedAt: Date,
        private readonly items: PackingItem[],
        private readonly looseItems: LooseItem[],
    ) {}

    static create(orderId: string, operatorId: string): Packing {
        const now = new Date();
        return new Packing(crypto.randomUUID(), orderId, operatorId, now, now, [], []);
    }

    static restore(props: RestoreProps): Packing {
        return new Packing(
            props.id,
            props.orderId,
            props.operatorId,
            props.packedAt,
            props.updatedAt,
            props.items,
            props.looseItems,
        );
    }

    addTier(snapshot: AddTierSnapshot): void {
        const existing = this.items.find((item) => item.getTierId() === snapshot.tierId);
        if (existing) {
            existing.increment();
            return;
        }
        this.items.push(
            PackingItem.create({
                tierId: snapshot.tierId,
                tierName: snapshot.tierName,
                categoryName: snapshot.categoryName,
                unitCostCents: snapshot.unitCostCents,
            }),
        );
    }

    incrementTier(tierId: string): void {
        const item = this.items.find((i) => i.getTierId() === tierId);
        if (item) item.increment();
    }

    decrementTier(tierId: string): void {
        const item = this.items.find((i) => i.getTierId() === tierId);
        if (!item) return;
        const newQty = item.decrement();
        if (newQty <= 0) {
            const index = this.items.indexOf(item);
            this.items.splice(index, 1);
        }
    }

    addLooseItem(name: string, cost: Money): void {
        this.looseItems.push(LooseItem.create({ name, costCents: cost.toCents() }));
    }

    removeLooseItem(looseItemId: string): void {
        const index = this.looseItems.findIndex((i) => i.id === looseItemId);
        if (index !== -1) this.looseItems.splice(index, 1);
    }

    computeItemsCost(): Money {
        const itemsCost = this.items.reduce((acc, item) => acc.add(item.getTotalCost()), Money.zero());
        return this.looseItems.reduce((acc, item) => acc.add(Money.fromCents(item.getCostCents())), itemsCost);
    }

    computeLiveMargin(sale: Money, shipping: Money): { marginValue: Money; marginPct: number } {
        const cost = this.computeItemsCost();
        const marginValue = sale.subtract(cost).subtract(shipping);
        const marginPct = marginValue.percentageOf(sale);
        return { marginValue, marginPct };
    }

    ensureCanConclude(): void {
        if (this.items.length + this.looseItems.length === 0) throw new PackingRequiresItemError();
    }

    getId(): string {
        return this.id;
    }

    getOrderId(): string {
        return this.orderId;
    }

    getOperatorId(): string {
        return this.operatorId;
    }

    getPackedAt(): Date {
        return this.packedAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    getItems(): PackingItem[] {
        return this.items;
    }

    getLooseItems(): LooseItem[] {
        return this.looseItems;
    }
}
