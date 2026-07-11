import type { IUseCase } from "./IUseCase";
import type { Order } from "@/server/domain/entity/Order";

export type Input = { tiktokOrderId: string };
export type Output = Order;

export type IIngestTikTokOrderByIdUseCase = IUseCase<Input, Output>;
