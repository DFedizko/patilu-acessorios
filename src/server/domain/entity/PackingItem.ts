import { Money } from "@/server/domain/value-object/Money";

type CreateProps = {
    tierId?: string;
    tierName: string;
    categoryName: string;
    unitCostCents: number;
};

type RestoreProps = {
    id: string;
    packingId: string;
    tierId?: string;
    tierName: string;
    categoryName: string;
    unitCostCents: number;
    quantity: number;
};

export class PackingItem {
    private constructor(
        private readonly id: string,
        private readonly packingId: string,
        private readonly tierId: string | undefined,
        private readonly tierName: string,
        private readonly categoryName: string,
        private readonly unitCostCents: number,
        private quantity: number,
    ) {}

    static create(props: CreateProps): PackingItem {
        return new PackingItem(
            crypto.randomUUID(),
            "",
            props.tierId,
            props.tierName,
            props.categoryName,
            props.unitCostCents,
            1,
        );
    }

    static restore(props: RestoreProps): PackingItem {
        return new PackingItem(
            props.id,
            props.packingId,
            props.tierId,
            props.tierName,
            props.categoryName,
            props.unitCostCents,
            props.quantity,
        );
    }

    increment(): number {
        this.quantity += 1;
        return this.quantity;
    }

    decrement(): number {
        this.quantity -= 1;
        return this.quantity;
    }

    getTotalCost(): Money {
        return Money.fromCents(this.unitCostCents).multiplyByQuantity(this.quantity);
    }

    getId(): string {
        return this.id;
    }

    getPackingId(): string {
        return this.packingId;
    }

    getTierId(): string | undefined {
        return this.tierId;
    }

    getTierName(): string {
        return this.tierName;
    }

    getCategoryName(): string {
        return this.categoryName;
    }

    getUnitCostCents(): number {
        return this.unitCostCents;
    }

    getQuantity(): number {
        return this.quantity;
    }
}
