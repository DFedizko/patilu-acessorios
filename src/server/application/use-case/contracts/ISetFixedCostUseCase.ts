import type { IUseCase } from "./IUseCase";
import type { SetFixedCostDTO } from "@/lib/schemas";

export type Input = SetFixedCostDTO;
export type Output = { fixedCostPerOrderCents: number };

export type ISetFixedCostUseCase = IUseCase<Input, Output>;
