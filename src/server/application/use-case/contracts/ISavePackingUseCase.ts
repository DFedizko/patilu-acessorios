import type { IUseCase } from "./IUseCase";
import type { Packing } from "@/server/domain/entity/Packing";
import type { SavePackingDTO } from "@/lib/schemas";

export type Input = SavePackingDTO & { orderId: string; operatorId: string };
export type Output = Packing;

export type ISavePackingUseCase = IUseCase<Input, Output>;
