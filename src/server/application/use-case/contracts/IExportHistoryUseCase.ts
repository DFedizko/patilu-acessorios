import type { IUseCase } from "./IUseCase";
import type { PeriodQueryDTO } from "@/lib/schemas";

export type Input = PeriodQueryDTO;
export type Output = string;

export type IExportHistoryUseCase = IUseCase<Input, Output>;
