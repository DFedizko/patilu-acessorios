import { DomainError } from "@/server/domain/error/DomainError";
import { TierCostMustBePositiveError } from "@/server/domain/error/TierCostMustBePositiveError";
import { Barcode } from "@/server/domain/value-object/Barcode";
import { Money } from "@/server/domain/value-object/Money";

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

export class Tier {
    private constructor(
        private readonly id: string,
        private name: string,
        private cost: Money,
        private readonly barcode: Barcode,
        private categoryId: string | null,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    static create(props: CreateProps): Tier {
        if (!props.name || props.name.trim().length === 0) {
            throw new DomainError("TIER_NAME_REQUIRED", 422, "Tier name is required");
        }
        if (!props.cost.isPositive()) {
            throw new TierCostMustBePositiveError();
        }
        return new Tier(
            crypto.randomUUID(),
            props.name.trim(),
            props.cost,
            props.barcode,
            props.categoryId ?? null,
            new Date(),
            new Date(),
        );
    }

    static restore(props: RestoreProps): Tier {
        return new Tier(
            props.id,
            props.name,
            props.cost,
            props.barcode,
            props.categoryId,
            props.createdAt,
            props.updatedAt,
        );
    }

    rename(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new DomainError("TIER_NAME_REQUIRED", 422, "Tier name is required");
        }
        this.name = name.trim();
    }

    changeCost(cost: Money): void {
        if (!cost.isPositive()) {
            throw new TierCostMustBePositiveError();
        }
        this.cost = cost;
    }

    assignToCategory(categoryId: string): void {
        this.categoryId = categoryId;
    }

    moveToUncategorized(): void {
        this.categoryId = null;
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getBarcode(): Barcode {
        return this.barcode;
    }

    getCost(): Money {
        return this.cost;
    }

    getCategoryId(): string | null {
        return this.categoryId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
