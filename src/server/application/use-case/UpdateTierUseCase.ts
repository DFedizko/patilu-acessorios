import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { Money } from "@/server/domain/value-object/Money";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { Tier } from "@/server/domain/entity/Tier";
import type { IUpdateTierUseCase, Input, Output } from "./contracts/IUpdateTierUseCase";

@injectable()
export class UpdateTierUseCase implements IUpdateTierUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const tier = await this.tierRepo.findById(input.id);
        if (input.name !== undefined) {
            tier.rename(input.name);
        }
        if (input.costReais !== undefined) {
            tier.changeCost(Money.fromReais(input.costReais));
        }
        if (input.categoryId !== undefined) {
            if (input.categoryId === null) {
                tier.moveToUncategorized();
            } else {
                tier.assignToCategory(input.categoryId);
            }
        }
        await this.tierRepo.save(tier);
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
