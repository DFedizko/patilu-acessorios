import { CategoryNameRequiredError } from "@/server/domain/error/CategoryNameRequiredError";
import { Entity } from "./Entity";

type RestoreProps = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

type CategoryProps = {
    name: string;
    createdAt: Date;
    updatedAt: Date;
};

export class Category extends Entity<CategoryProps> {
    private constructor(
        protected readonly props: CategoryProps,
        id?: string,
    ) {
        super(props, id);
    }

    static create(name: string): Category {
        if (!name || name.trim().length === 0) {
            throw new CategoryNameRequiredError();
        }
        return new Category({ name: name.trim(), createdAt: new Date(), updatedAt: new Date() });
    }

    static restore(props: RestoreProps): Category {
        return new Category({ name: props.name, createdAt: props.createdAt, updatedAt: props.updatedAt }, props.id);
    }

    rename(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new CategoryNameRequiredError();
        }
        this.props.name = name.trim();
    }

    getName(): string {
        return this.props.name;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }
}
