import type { IUseCase } from "./IUseCase";
import type { PeriodQueryDTO } from "@/lib/schemas";

export type Input = PeriodQueryDTO;
export type Output = { totalCents: number; available: boolean; source: "TIKTOK" | "MANUAL" };

export type IGetAdSpendUseCase = IUseCase<Input, Output>;
