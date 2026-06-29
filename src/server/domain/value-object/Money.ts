export class Money {
    private constructor(private readonly cents: number) {}

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

    isPositive(): boolean {
        return this.cents > 0;
    }
}
