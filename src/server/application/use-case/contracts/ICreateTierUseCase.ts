import type { IUseCase } from "./IUseCase";
import type { CreateTierDTO } from "@/lib/schemas";

export type Input = CreateTierDTO;
export type Output = { id: string; name: string; costCents: number; barcode: string; categoryId: string | null };

export type ICreateTierUseCase = IUseCase<Input, Output>;
