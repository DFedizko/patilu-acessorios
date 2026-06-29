import type { IUseCase } from "./IUseCase";

export type Input = { id: string };
export type Output = void;

export type IDeleteCategoryUseCase = IUseCase<Input, Output>;
