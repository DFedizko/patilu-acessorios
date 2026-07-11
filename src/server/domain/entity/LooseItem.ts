import { Money } from "@/server/domain/value-object/Money";
import { UUID } from "@/server/domain/value-object/UUID";
import { Entity } from "./Entity";

type CreateProps = {
    name: string;
    costAmount: Money;
};

type RestoreProps = {
    id: string;
    packingId: string;
    name: string;
    costAmount: Money;
};

type LooseItemProps = {
    packingId: string;
    name: string;
    costAmount: Money;
};

export class LooseItem extends Entity<LooseItemProps, UUID> {
    private constructor(
        protected readonly props: LooseItemProps,
        id?: UUID,
    ) {
        super(props, id);
    }

    static create(props: CreateProps): LooseItem {
        return new LooseItem({ packingId: "", name: props.name, costAmount: props.costAmount });
    }

    static restore(props: RestoreProps): LooseItem {
        return new LooseItem(
            {
                packingId: props.packingId,
                name: props.name,
                costAmount: props.costAmount,
            },
            UUID.restore(props.id),
        );
    }

    getPackingId(): string {
        return this.props.packingId;
    }

    getName(): string {
        return this.props.name;
    }

    getCost(): Money {
        return this.props.costAmount;
    }
}
