import type { IUseCase } from "./IUseCase";
import type { AddFixedCostDTO, FixedCostEntryDTO } from "@/lib/schemas";

export type Input = AddFixedCostDTO;
export type Output = { costs: FixedCostEntryDTO[] };

export type IAddFixedCostUseCase = IUseCase<Input, Output>;
