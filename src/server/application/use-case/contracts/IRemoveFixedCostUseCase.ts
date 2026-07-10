import type { IUseCase } from "./IUseCase";
import type { RemoveFixedCostDTO, FixedCostEntryDTO } from "@/lib/schemas";

export type Input = RemoveFixedCostDTO;
export type Output = { costs: FixedCostEntryDTO[] };

export type IRemoveFixedCostUseCase = IUseCase<Input, Output>;
