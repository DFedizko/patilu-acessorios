import type { IUseCase } from "./IUseCase";

export type Input = void;
export type Output = { fixedCostPerOrderCents: number };

export type IGetFixedCostUseCase = IUseCase<Input, Output>;
