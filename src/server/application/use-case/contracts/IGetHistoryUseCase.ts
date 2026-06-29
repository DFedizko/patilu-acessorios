import type { IUseCase } from "./IUseCase";
import type { PeriodQueryDTO, HistoryRow, HistorySummary } from "@/lib/schemas";

export type Input = PeriodQueryDTO;
export type Output = { rows: HistoryRow[]; summary: HistorySummary };

export type IGetHistoryUseCase = IUseCase<Input, Output>;
