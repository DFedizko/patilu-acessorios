import { CategoryNameRequiredError } from "@/server/domain/error/CategoryNameRequiredError";

type RestoreProps = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export class Category {
    private constructor(
        private readonly id: string,
        private name: string,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    static create(name: string): Category {
        if (!name || name.trim().length === 0) {
            throw new CategoryNameRequiredError();
        }
        return new Category(crypto.randomUUID(), name.trim(), new Date(), new Date());
    }

    static restore(props: RestoreProps): Category {
        return new Category(props.id, props.name, props.createdAt, props.updatedAt);
    }

    rename(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new CategoryNameRequiredError();
        }
        this.name = name.trim();
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
