import { Money } from "@/server/domain/value-object/Money";
import { UUID } from "@/server/domain/value-object/UUID";
import { Entity } from "./Entity";

type CreateProps = {
    tierId?: string;
    tierName: string;
    categoryName: string;
    unitCostAmount: Money;
};

type RestoreProps = {
    id: string;
    packingId: string;
    tierId?: string;
    tierName: string;
    categoryName: string;
    unitCostAmount: Money;
    quantity: number;
};

type PackingItemProps = {
    packingId: string;
    tierId: string | undefined;
    tierName: string;
    categoryName: string;
    unitCostAmount: Money;
    quantity: number;
};

export class PackingItem extends Entity<PackingItemProps, UUID> {
    private constructor(
        protected readonly props: PackingItemProps,
        id?: UUID,
    ) {
        super(props, id);
    }

    static create(props: CreateProps): PackingItem {
        return new PackingItem({
            packingId: "",
            tierId: props.tierId,
            tierName: props.tierName,
            categoryName: props.categoryName,
            unitCostAmount: props.unitCostAmount,
            quantity: 1,
        });
    }

    static restore(props: RestoreProps): PackingItem {
        return new PackingItem(
            {
                packingId: props.packingId,
                tierId: props.tierId,
                tierName: props.tierName,
                categoryName: props.categoryName,
                unitCostAmount: props.unitCostAmount,
                quantity: props.quantity,
            },
            UUID.restore(props.id),
        );
    }

    increment(): number {
        this.props.quantity += 1;
        return this.props.quantity;
    }

    decrement(): number {
        this.props.quantity -= 1;
        return this.props.quantity;
    }

    getTotalCost(): Money {
        return this.props.unitCostAmount.multiplyByQuantity(this.props.quantity);
    }

    getPackingId(): string {
        return this.props.packingId;
    }

    getTierId(): string | undefined {
        return this.props.tierId;
    }

    getTierName(): string {
        return this.props.tierName;
    }

    getCategoryName(): string {
        return this.props.categoryName;
    }

    getUnitCost(): Money {
        return this.props.unitCostAmount;
    }

    getQuantity(): number {
        return this.props.quantity;
    }
}
