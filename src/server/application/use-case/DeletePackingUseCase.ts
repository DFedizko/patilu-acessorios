import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { IDeletePackingUseCase, Input, Output } from "./contracts/IDeletePackingUseCase";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { IPackingRepository } from "@/server/domain/repository/IPackingRepository";
import { SYMBOLS } from "@/server/di/symbols";

@injectable()
export class DeletePackingUseCase implements IDeletePackingUseCase {
    constructor(
        @inject(SYMBOLS.OrderRepository) private readonly orderRepo: IOrderRepository,
        @inject(SYMBOLS.PackingRepository) private readonly packingRepo: IPackingRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        await this.packingRepo.deleteByOrderId(input.orderId);
        const order = await this.orderRepo.findById(input.orderId);
        order.markNotPacked();
        await this.orderRepo.save(order);
    }
}
