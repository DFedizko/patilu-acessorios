import { Entity } from "./Entity";

type CreateProps = {
    id?: string;
    name: string;
    costCents: number;
};

type RestoreProps = {
    id: string;
    packingId: string;
    name: string;
    costCents: number;
};

type LooseItemProps = {
    packingId: string;
    name: string;
    costCents: number;
};

export class LooseItem extends Entity<LooseItemProps> {
    private constructor(
        protected readonly props: LooseItemProps,
        id?: string,
    ) {
        super(props, id);
    }

    static create(props: CreateProps): LooseItem {
        return new LooseItem({ packingId: "", name: props.name, costCents: props.costCents }, props.id);
    }

    static restore(props: RestoreProps): LooseItem {
        return new LooseItem(
            {
                packingId: props.packingId,
                name: props.name,
                costCents: props.costCents,
            },
            props.id,
        );
    }

    getPackingId(): string {
        return this.props.packingId;
    }

    getName(): string {
        return this.props.name;
    }

    getCostCents(): number {
        return this.props.costCents;
    }
}
