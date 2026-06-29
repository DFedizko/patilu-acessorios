import type { IUseCase } from "./IUseCase";
import type { SetManualAdSpendDTO } from "@/lib/schemas";

export type Input = SetManualAdSpendDTO;
export type Output = void;

export type ISetManualAdSpendUseCase = IUseCase<Input, Output>;
