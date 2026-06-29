import type { IUseCase } from "./IUseCase";
import type { Order } from "@/server/domain/entity/Order";
import type { Packing } from "@/server/domain/entity/Packing";

export type Input = { orderId: string };
export type Output = { order: Order; packing: Packing | null };

export type IGetOrderForPackingUseCase = IUseCase<Input, Output>;
