import type { IUseCase } from "./IUseCase";
import type { FixedCostEntryDTO } from "@/lib/schemas";

export type Input = void;
export type Output = { costs: FixedCostEntryDTO[] };

export type IGetFixedCostsUseCase = IUseCase<Input, Output>;
