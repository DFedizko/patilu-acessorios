import type { IUseCase } from "./IUseCase";
import type { CreateCategoryDTO } from "@/lib/schemas";

export type Input = CreateCategoryDTO;
export type Output = { id: string; name: string };

export type ICreateCategoryUseCase = IUseCase<Input, Output>;
