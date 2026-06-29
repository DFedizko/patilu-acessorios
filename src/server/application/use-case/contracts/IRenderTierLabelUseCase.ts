import type { IUseCase } from "./IUseCase";

export type Input = { id: string };
export type Output = { svg: string };

export type IRenderTierLabelUseCase = IUseCase<Input, Output>;
