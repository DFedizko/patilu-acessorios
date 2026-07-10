import type { PeriodQueryDTO } from "@/lib/schemas";

export type AdSpendResult = { totalCents: number; available: boolean; source: "TIKTOK" | "MANUAL" };

export interface IAdSpendResolver {
    resolve(input: PeriodQueryDTO): Promise<AdSpendResult>;
}
