const BARCODE_PREFIX = "T";
const BARCODE_PATTERN = /^T[A-Za-z0-9_-]+$/;

export class Barcode {
    private constructor(private readonly value: string) {}

    static fromString(value: string): Barcode {
        if (!BARCODE_PATTERN.test(value)) {
            throw new Error(
                `Invalid barcode format: "${value}". Must start with "${BARCODE_PREFIX}" followed by alphanumeric characters.`,
            );
        }
        return new Barcode(value);
    }

    static fromNanoid(nanoid: string): Barcode {
        return new Barcode(`${BARCODE_PREFIX}${nanoid}`);
    }

    toString(): string {
        return this.value;
    }
}
