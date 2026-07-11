import { DomainError } from "@/server/domain/error/DomainError";
import { ValueObject } from "./ValueObject";

export class UUID extends ValueObject<{ value: string }> {
    private static readonly REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly _value: string) {
        super({ value: _value });
    }

    static create(): UUID {
        return new UUID(crypto.randomUUID());
    }

    static restore(value: string): UUID {
        if (!UUID.isValid(value)) {
            throw new DomainError("INVALID_UUID", 422, `Invalid UUID: ${value}`);
        }
        return new UUID(value);
    }

    static isValid(value: string): boolean {
        return UUID.REGEX.test(value);
    }

    get value(): string {
        return this._value;
    }
}
