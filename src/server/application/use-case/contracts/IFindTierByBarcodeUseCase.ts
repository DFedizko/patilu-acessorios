import type { IUseCase } from "./IUseCase";

export type Input = { barcode: string };
export type Output = { id: string; name: string; costCents: number; barcode: string; categoryId: string | null };

export type IFindTierByBarcodeUseCase = IUseCase<Input, Output>;
