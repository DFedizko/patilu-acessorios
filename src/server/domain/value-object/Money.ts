import { ValueObject } from "./ValueObject";

export class Money extends ValueObject<{ cents: number }> {
    private constructor(protected readonly cents: number) {
        super({ cents });
    }

    static fromCents(cents: number): Money {
        if (!Number.isInteger(cents)) {
            throw new Error(`Money must be an integer number of cents, got: ${cents}`);
        }
        return new Money(cents);
    }

    static fromReais(reais: number): Money {
        return new Money(Math.round(reais * 100));
    }

    static zero(): Money {
        return new Money(0);
    }

    add(other: Money): Money {
        return new Money(this.cents + other.cents);
    }

    subtract(other: Money): Money {
        return new Money(this.cents - other.cents);
    }

    multiplyByQuantity(quantity: number): Money {
        return new Money(Math.round(this.cents * quantity));
    }

    dividedByCount(count: number): Money {
        if (count === 0) {
            return Money.zero();
        }
        return new Money(Math.round(this.cents / count));
    }

    percentageOf(total: Money): number {
        if (total.cents === 0) {
            return 0;
        }
        return (this.cents / total.cents) * 100;
    }

    toCents(): number {
        return this.cents;
    }

    toDecimalString(): string {
        return (this.cents / 100).toFixed(2);
    }

    toBRL(): string {
        return (this.cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    isPositive(): boolean {
        return this.cents > 0;
    }
}
