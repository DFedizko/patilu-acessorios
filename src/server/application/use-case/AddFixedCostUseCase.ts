import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { Money } from "@/server/domain/value-object/Money";
import type { IFixedCostsGateway } from "@/server/application/gateway/IFixedCostsGateway";
import type { IAddFixedCostUseCase, Input, Output } from "./contracts/IAddFixedCostUseCase";

@injectable()
export class AddFixedCostUseCase implements IAddFixedCostUseCase {
    constructor(
        @inject(SYMBOLS.FixedCostsGateway)
        private readonly fixedCostsGateway: IFixedCostsGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        const current = await this.fixedCostsGateway.get();
        const updated = current.addFixedCost(input.name, Money.fromCents(input.amountCents), input.scope);
        await this.fixedCostsGateway.save(updated);
        return { costs: updated.toPersistence() };
    }
}
