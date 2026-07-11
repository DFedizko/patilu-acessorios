import { UUID } from "@/server/domain/value-object/UUID";

export abstract class Entity<Props, Id = string> {
    readonly id: Id;

    constructor(
        protected readonly props: Props,
        id?: Id,
    ) {
        this.id = id ?? (UUID.create() as Id);
    }

    equals(entity: Entity<Props, Id>): boolean {
        if (entity === null || entity === undefined) return false;
        return entity === this;
    }
}
