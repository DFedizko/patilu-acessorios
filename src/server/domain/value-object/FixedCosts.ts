import { Money } from "@/server/domain/value-object/Money";
import { ValueObject } from "./ValueObject";

export type FixedCostScope = "PER_ORDER" | "PER_PRODUCT";

type FixedCostEntry = {
    amount: Money;
    scope: FixedCostScope;
};

export type FixedCost = {
    name: string;
    amount: Money;
    scope: FixedCostScope;
};

export type PersistedFixedCost = {
    name: string;
    amountCents: number;
    scope: FixedCostScope;
};

export class FixedCosts extends ValueObject<{ entries: ReadonlyMap<string, FixedCostEntry> }> {
    private constructor(private readonly entries: ReadonlyMap<string, FixedCostEntry>) {
        super({ entries });
    }

    static empty(): FixedCosts {
        return new FixedCosts(new Map());
    }

    static fromPersistence(costs: PersistedFixedCost[]): FixedCosts {
        return costs.reduce(
            (acc, cost) => acc.addFixedCost(cost.name, Money.fromCents(cost.amountCents), cost.scope),
            FixedCosts.empty(),
        );
    }

    addFixedCost(name: string, amount: Money, scope: FixedCostScope): FixedCosts {
        const trimmed = name.trim();
        const next = new Map(this.entries);
        next.set(trimmed, { amount, scope });
        return new FixedCosts(next);
    }

    removeFixedCost(name: string): FixedCosts {
        const next = new Map(this.entries);
        next.delete(name.trim());
        return new FixedCosts(next);
    }

    totalForOrder(itemCount: number): Money {
        const products = Math.max(0, itemCount);
        return Array.from(this.entries.values()).reduce((total, entry) => {
            const applied = entry.scope === "PER_PRODUCT" ? entry.amount.multiplyByQuantity(products) : entry.amount;
            return total.add(applied);
        }, Money.zero());
    }

    list(): FixedCost[] {
        return Array.from(this.entries.entries()).map(([name, entry]) => ({
            name,
            amount: entry.amount,
            scope: entry.scope,
        }));
    }

    toPersistence(): PersistedFixedCost[] {
        return this.list().map((cost) => ({ name: cost.name, amountCents: cost.amount.toCents(), scope: cost.scope }));
    }
}
