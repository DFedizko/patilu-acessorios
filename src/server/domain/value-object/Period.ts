import { ValueObject } from "./ValueObject";

const SAO_PAULO_TZ = "America/Sao_Paulo";

export class Period extends ValueObject<{ start: Date; end: Date }> {
    private constructor(
        readonly start: Date,
        readonly end: Date,
    ) {
        super({ start, end });
    }

    static create(start: Date, end: Date): Period {
        const startSp = Period.toSaoPauloMidnight(start);
        const endSp = Period.toSaoPauloMidnight(end);
        if (startSp > endSp) {
            throw new Error(
                `Period start must not be after end. Got start=${start.toISOString()}, end=${end.toISOString()}`,
            );
        }
        return new Period(startSp, endSp);
    }

    private static toSaoPauloMidnight(date: Date): Date {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: SAO_PAULO_TZ,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
        const [year, month, day] = formatter.format(date).split("-").map(Number);
        return new Date(Date.UTC(year!, month! - 1, day!));
    }
}
