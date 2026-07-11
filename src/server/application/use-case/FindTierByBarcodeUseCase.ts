import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { Tier } from "@/server/domain/entity/Tier";
import type { IFindTierByBarcodeUseCase, Input, Output } from "./contracts/IFindTierByBarcodeUseCase";

@injectable()
export class FindTierByBarcodeUseCase implements IFindTierByBarcodeUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const tier = await this.tierRepo.findByBarcode(input.barcode);
        return toOutput(tier);
    }
}

const toOutput = (tier: Tier): Output => ({
    id: tier.id.value,
    name: tier.getName(),
    costCents: tier.getCost().toCents(),
    barcode: tier.getBarcode().toString(),
    categoryId: tier.getCategoryId(),
});
