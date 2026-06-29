import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IConfigPersistenceGateway } from "@/server/application/gateway/IConfigPersistenceGateway";
import type { IGetFixedCostUseCase, Output } from "./contracts/IGetFixedCostUseCase";

@injectable()
export class GetFixedCostUseCase implements IGetFixedCostUseCase {
    constructor(
        @inject(SYMBOLS.ConfigPersistenceGateway)
        private readonly configGateway: IConfigPersistenceGateway,
    ) {}

    async execute(): Promise<Output> {
        const fixedCostPerOrderCents = await this.configGateway.getFixedCostPerOrderCents();
        return { fixedCostPerOrderCents };
    }
}
