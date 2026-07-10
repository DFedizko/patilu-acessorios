import type { IUseCase } from "./IUseCase";
import type { PeriodQueryDTO } from "@/lib/schemas";
import type { AdSpendResult } from "@/server/application/service/contracts/IAdSpendResolver";

export type Input = PeriodQueryDTO;
export type Output = AdSpendResult;

export type IGetAdSpendUseCase = IUseCase<Input, Output>;
