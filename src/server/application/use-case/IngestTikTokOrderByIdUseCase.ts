import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { ITikTokOrdersGateway } from "@/server/application/gateway/ITikTokOrdersGateway";
import { TikTokOrderTranslator } from "@/server/domain/acl/TikTokOrderTranslator";
import type { IIngestTikTokOrderByIdUseCase, Input, Output } from "./contracts/IIngestTikTokOrderByIdUseCase";

@injectable()
export class IngestTikTokOrderByIdUseCase implements IIngestTikTokOrderByIdUseCase {
    constructor(
        @inject(SYMBOLS.TikTokOrdersGateway) private readonly ordersGateway: ITikTokOrdersGateway,
        @inject(SYMBOLS.OrderRepository) private readonly orderRepository: IOrderRepository,
        @inject(SYMBOLS.TikTokOrderTranslator) private readonly translator: TikTokOrderTranslator,
    ) {}

    async execute(input: Input): Promise<Output> {
        const tiktokOrderDTO = await this.ordersGateway.getOrder(input.tiktokOrderId);
        const order = this.translator.toDomain(tiktokOrderDTO);
        return this.orderRepository.upsert(order);
    }
}
