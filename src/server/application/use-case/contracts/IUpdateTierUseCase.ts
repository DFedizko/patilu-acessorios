import type { IUseCase } from "./IUseCase";
import type { UpdateTierDTO } from "@/lib/schemas";

export type Input = UpdateTierDTO & { id: string };
export type Output = { id: string; name: string; costCents: number; barcode: string; categoryId: string | null };

export type IUpdateTierUseCase = IUseCase<Input, Output>;
