import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { DomainError } from "@/server/domain/error/DomainError";
import { Money } from "@/server/domain/value-object/Money";
import type { IConfigPersistenceGateway } from "@/server/application/gateway/IConfigPersistenceGateway";
import type { ISetFixedCostUseCase, Input, Output } from "./contracts/ISetFixedCostUseCase";

const VALIDATION_ERROR_CODE = "VALIDATION_ERROR";
const VALIDATION_ERROR_STATUS = 400;

@injectable()
export class SetFixedCostUseCase implements ISetFixedCostUseCase {
    constructor(
        @inject(SYMBOLS.ConfigPersistenceGateway)
        private readonly configGateway: IConfigPersistenceGateway,
    ) {}

    async execute(input: Input): Promise<Output> {
        if (input.amountReais < 0) {
            throw new DomainError(VALIDATION_ERROR_CODE, VALIDATION_ERROR_STATUS, "amountReais must be >= 0");
        }
        const fixedCostPerOrderCents = Money.fromReais(input.amountReais).toCents();
        await this.configGateway.setFixedCostPerOrderCents(fixedCostPerOrderCents);
        return { fixedCostPerOrderCents };
    }
}
