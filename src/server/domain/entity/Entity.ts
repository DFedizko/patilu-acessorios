export abstract class Entity<Props> {
    readonly id: string;

    protected constructor(
        protected readonly props: Props,
        id?: string,
    ) {
        this.id = id ?? crypto.randomUUID();
    }

    equals(entity: Entity<Props>): boolean {
        if (entity === null || entity === undefined) return false;
        return entity === this;
    }
}
