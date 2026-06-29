import type { IUseCase } from "./IUseCase";
import type { PeriodQueryDTO, DashboardData } from "@/lib/schemas";

export type Input = PeriodQueryDTO;
export type Output = DashboardData;

export type IGetDashboardUseCase = IUseCase<Input, Output>;
