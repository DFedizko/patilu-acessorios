import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IFixedCostsGateway } from "@/server/application/gateway/IFixedCostsGateway";
import type { IGetFixedCostsUseCase, Output } from "./contracts/IGetFixedCostsUseCase";

@injectable()
export class GetFixedCostsUseCase implements IGetFixedCostsUseCase {
    constructor(
        @inject(SYMBOLS.FixedCostsGateway)
        private readonly fixedCostsGateway: IFixedCostsGateway,
    ) {}

    async execute(): Promise<Output> {
        const fixedCosts = await this.fixedCostsGateway.get();
        return { costs: fixedCosts.toPersistence() };
    }
}
