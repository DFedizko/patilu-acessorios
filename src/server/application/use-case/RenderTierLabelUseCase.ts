import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { IBarcodeRenderer } from "@/server/application/gateway/IBarcodeRenderer";
import type { IRenderTierLabelUseCase, Input, Output } from "./contracts/IRenderTierLabelUseCase";

@injectable()
export class RenderTierLabelUseCase implements IRenderTierLabelUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
        @inject(SYMBOLS.BarcodeRenderer)
        private readonly barcodeRenderer: IBarcodeRenderer,
    ) {}

    async execute(input: Input): Promise<Output> {
        const tier = await this.tierRepo.findById(input.id);
        const svg = this.barcodeRenderer.toSVG(tier.getBarcode().toString());
        return { svg };
    }
}
