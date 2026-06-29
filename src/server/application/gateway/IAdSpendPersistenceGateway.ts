import type { Period } from "@/server/domain/value-object/Period";

export interface IAdSpendPersistenceGateway {
    sumManualByPeriod(period: Period): Promise<number>;
    upsertDay(day: Date, amountCents: number, source: "TIKTOK" | "MANUAL"): Promise<void>;
}
