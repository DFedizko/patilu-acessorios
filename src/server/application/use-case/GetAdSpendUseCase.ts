import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { IAdSpendResolver } from "@/server/application/service/contracts/IAdSpendResolver";
import type { IGetAdSpendUseCase, Input, Output } from "./contracts/IGetAdSpendUseCase";

@injectable()
export class GetAdSpendUseCase implements IGetAdSpendUseCase {
    constructor(
        @inject(SYMBOLS.AdSpendResolver)
        private readonly adSpendResolver: IAdSpendResolver,
    ) {}

    async execute(input: Input): Promise<Output> {
        return this.adSpendResolver.resolve(input);
    }
}
