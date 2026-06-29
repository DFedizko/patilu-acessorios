import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IGetOrderForPackingUseCase, Input, Output } from "./contracts/IGetOrderForPackingUseCase";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { IPackingRepository } from "@/server/domain/repository/IPackingRepository";
import { SYMBOLS } from "@/server/di/symbols";

@injectable()
export class GetOrderForPackingUseCase implements IGetOrderForPackingUseCase {
    constructor(
        @inject(SYMBOLS.OrderRepository) private readonly orderRepo: IOrderRepository,
        @inject(SYMBOLS.PackingRepository) private readonly packingRepo: IPackingRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const order = await this.orderRepo.findById(input.orderId);
        const packing = await this.packingRepo.findByOrderId(input.orderId);
        return { order, packing };
    }
}
