import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import { TikTokOrderTranslator } from "@/server/domain/acl/TikTokOrderTranslator";
import type { IIngestTikTokOrderUseCase, Input, Output } from "./contracts/IIngestTikTokOrderUseCase";

@injectable()
export class IngestTikTokOrderUseCase implements IIngestTikTokOrderUseCase {
    constructor(
        @inject(SYMBOLS.OrderRepository) private readonly orderRepository: IOrderRepository,
        @inject(SYMBOLS.TikTokOrderTranslator) private readonly translator: TikTokOrderTranslator,
    ) {}

    async execute(input: Input): Promise<Output> {
        const order = this.translator.toDomain(input.tiktokOrderDTO);
        return this.orderRepository.upsert(order);
    }
}
