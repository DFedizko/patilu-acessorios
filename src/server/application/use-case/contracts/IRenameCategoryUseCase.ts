import type { IUseCase } from "./IUseCase";
import type { RenameCategoryDTO } from "@/lib/schemas";

export type Input = RenameCategoryDTO & { id: string };
export type Output = { id: string; name: string };

export type IRenameCategoryUseCase = IUseCase<Input, Output>;
