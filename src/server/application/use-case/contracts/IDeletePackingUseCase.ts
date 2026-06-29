import type { IUseCase } from "./IUseCase";

export type Input = { orderId: string };
export type Output = void;

export type IDeletePackingUseCase = IUseCase<Input, Output>;
