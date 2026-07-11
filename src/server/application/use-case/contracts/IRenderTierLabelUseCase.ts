import type { IUseCase } from "./IUseCase";

export type Input = { id: string; showText?: boolean };
export type Output = { svg: string };

export type IRenderTierLabelUseCase = IUseCase<Input, Output>;
