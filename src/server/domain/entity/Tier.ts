import { DomainError } from "@/server/domain/error/DomainError";
import { TierCostMustBePositiveError } from "@/server/domain/error/TierCostMustBePositiveError";
import { Barcode } from "@/server/domain/value-object/Barcode";
import { Money } from "@/server/domain/value-object/Money";
import { UUID } from "@/server/domain/value-object/UUID";
import { Entity } from "./Entity";

type CreateProps = {
    name: string;
    cost: Money;
    barcode: Barcode;
    categoryId?: string | null;
};

type RestoreProps = {
    id: string;
    name: string;
    cost: Money;
    barcode: Barcode;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type TierProps = {
    name: string;
    cost: Money;
    barcode: Barcode;
    categoryId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export class Tier extends Entity<TierProps, UUID> {
    private constructor(
        protected readonly props: TierProps,
        id?: UUID,
    ) {
        super(props, id);
    }

    static create(props: CreateProps): Tier {
        if (!props.name || props.name.trim().length === 0) {
            throw new DomainError("TIER_NAME_REQUIRED", 422, "Tier name is required");
        }
        if (!props.cost.isPositive()) {
            throw new TierCostMustBePositiveError();
        }
        return new Tier({
            name: props.name.trim(),
            cost: props.cost,
            barcode: props.barcode,
            categoryId: props.categoryId ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static restore(props: RestoreProps): Tier {
        return new Tier(
            {
                name: props.name,
                cost: props.cost,
                barcode: props.barcode,
                categoryId: props.categoryId,
                createdAt: props.createdAt,
                updatedAt: props.updatedAt,
            },
            UUID.restore(props.id),
        );
    }

    rename(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new DomainError("TIER_NAME_REQUIRED", 422, "Tier name is required");
        }
        this.props.name = name.trim();
    }

    changeCost(cost: Money): void {
        if (!cost.isPositive()) {
            throw new TierCostMustBePositiveError();
        }
        this.props.cost = cost;
    }

    assignToCategory(categoryId: string): void {
        this.props.categoryId = categoryId;
    }

    moveToUncategorized(): void {
        this.props.categoryId = null;
    }

    getName(): string {
        return this.props.name;
    }

    getBarcode(): Barcode {
        return this.props.barcode;
    }

    getCost(): Money {
        return this.props.cost;
    }

    getCategoryId(): string | null {
        return this.props.categoryId;
    }

    getCreatedAt(): Date {
        return this.props.createdAt;
    }
}
