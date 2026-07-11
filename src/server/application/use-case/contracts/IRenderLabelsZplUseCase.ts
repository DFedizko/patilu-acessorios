import type { IUseCase } from "./IUseCase";
import type { RenderLabelsZplDTO } from "@/lib/schemas";

export type Input = RenderLabelsZplDTO;
export type Output = { zpl: string };

export type IRenderLabelsZplUseCase = IUseCase<Input, Output>;
