import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { DomainError } from "@/server/domain/error/DomainError";
import { Tier } from "@/server/domain/entity/Tier";
import { Money } from "@/server/domain/value-object/Money";
import { Barcode } from "@/server/domain/value-object/Barcode";
import { BarcodeCodeGenerator } from "@/server/domain/service/BarcodeCodeGenerator";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { ICreateTierUseCase, Input, Output } from "./contracts/ICreateTierUseCase";

const MAX_BARCODE_RETRIES = 3;

@injectable()
export class CreateTierUseCase implements ICreateTierUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
        @inject(SYMBOLS.CategoryRepository)
        private readonly categoryRepo: ICategoryRepository,
        @inject(SYMBOLS.BarcodeCodeGenerator)
        private readonly barcodeGenerator: BarcodeCodeGenerator,
    ) {}

    async execute(input: Input): Promise<Output> {
        if (input.categoryId) {
            await this.categoryRepo.findById(input.categoryId);
        }
        const cost = Money.fromReais(input.costReais);
        for (let attempt = 0; attempt < MAX_BARCODE_RETRIES; attempt++) {
            const barcode = Barcode.fromNanoid(this.barcodeGenerator.generate());
            const tier = Tier.create({ name: input.name, cost, barcode, categoryId: input.categoryId ?? null });
            try {
                await this.tierRepo.save(tier);
                return this.toOutput(tier);
            } catch (error) {
                if (
                    error instanceof DomainError &&
                    error.code === "DUPLICATE_BARCODE" &&
                    attempt < MAX_BARCODE_RETRIES - 1
                ) {
                    continue;
                }
                throw error;
            }
        }
        throw new DomainError("DUPLICATE_BARCODE", 422, "Could not generate a unique barcode after retries");
    }

    private toOutput(tier: Tier): Output {
        return {
            id: tier.id.value,
            name: tier.getName(),
            costCents: tier.getCost().toCents(),
            barcode: tier.getBarcode().toString(),
            categoryId: tier.getCategoryId(),
        };
    }
}
