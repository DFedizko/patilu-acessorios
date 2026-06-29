type CreateProps = {
    name: string;
    costCents: number;
};

type RestoreProps = {
    id: string;
    packingId: string;
    name: string;
    costCents: number;
};

export class LooseItem {
    private constructor(
        private readonly id: string,
        private readonly packingId: string,
        private readonly name: string,
        private readonly costCents: number,
    ) {}

    static create(props: CreateProps): LooseItem {
        return new LooseItem(crypto.randomUUID(), "", props.name, props.costCents);
    }

    static restore(props: RestoreProps): LooseItem {
        return new LooseItem(props.id, props.packingId, props.name, props.costCents);
    }

    getId(): string {
        return this.id;
    }

    getPackingId(): string {
        return this.packingId;
    }

    getName(): string {
        return this.name;
    }

    getCostCents(): number {
        return this.costCents;
    }
}
