import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IAdSpendPersistenceGateway } from "@/server/application/gateway/IAdSpendPersistenceGateway";
import type { ISetManualAdSpendUseCase, Input, Output } from "./contracts/ISetManualAdSpendUseCase";

@injectable()
export class SetManualAdSpendUseCase implements ISetManualAdSpendUseCase {
    constructor(
        @inject(SYMBOLS.AdSpendPersistenceGateway)
        private readonly adSpendGateway: IAdSpendPersistenceGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        const amountCents = Math.round(input.amountReais * 100);
        await this.adSpendGateway.upsertDay(new Date(input.day), amountCents, "MANUAL");
    }
}
