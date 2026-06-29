import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { resolvePeriod } from "@/server/application/resolve-period";
import type { ShipmentStatus } from "@/server/domain/entity/Order";
import type { IOrderListPersistenceGateway } from "@/server/application/gateway/IOrderListPersistenceGateway";
import type { IListOrdersUseCase, Input, Output } from "./contracts/IListOrdersUseCase";

@injectable()
export class ListOrdersUseCase implements IListOrdersUseCase {
    constructor(
        @inject(SYMBOLS.OrderListPersistenceGateway)
        private readonly orderListGateway: IOrderListPersistenceGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        const period = resolvePeriod(input);
        return this.orderListGateway.listByPeriod(period, input.status as ShipmentStatus | undefined);
    }
}
