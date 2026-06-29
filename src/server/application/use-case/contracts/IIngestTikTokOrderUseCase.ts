import type { IUseCase } from "./IUseCase";
import type { TikTokOrderDTO } from "@/server/application/gateway/ITikTokOrdersGateway";
import type { Order } from "@/server/domain/entity/Order";

export type Input = { tiktokOrderDTO: TikTokOrderDTO };
export type Output = Order;

export type IIngestTikTokOrderUseCase = IUseCase<Input, Output>;
