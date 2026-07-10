import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IFixedCostsGateway } from "@/server/application/gateway/IFixedCostsGateway";
import type { IRemoveFixedCostUseCase, Input, Output } from "./contracts/IRemoveFixedCostUseCase";

@injectable()
export class RemoveFixedCostUseCase implements IRemoveFixedCostUseCase {
    constructor(
        @inject(SYMBOLS.FixedCostsGateway)
        private readonly fixedCostsGateway: IFixedCostsGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        const current = await this.fixedCostsGateway.get();
        const updated = current.removeFixedCost(input.name);
        await this.fixedCostsGateway.save(updated);
        return { costs: updated.toPersistence() };
    }
}
