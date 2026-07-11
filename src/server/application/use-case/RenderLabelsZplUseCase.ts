import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { IZplLabelRenderer } from "@/server/application/gateway/IZplLabelRenderer";
import type { IRenderLabelsZplUseCase, Input, Output } from "./contracts/IRenderLabelsZplUseCase";

@injectable()
export class RenderLabelsZplUseCase implements IRenderLabelsZplUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
        @inject(SYMBOLS.ZplLabelRenderer)
        private readonly zplRenderer: IZplLabelRenderer,
    ) {}

    async execute(input: Input): Promise<Output> {
        const tiers = await this.tierRepo.findByIds(input.items.map((item) => item.tierId));
        const tiersById = new Map(tiers.map((tier) => [tier.id.value, tier]));
        const barcodes = input.items.flatMap((item) =>
            Array.from({ length: item.quantity }, () => tiersById.get(item.tierId)!.getBarcode().toString()),
        );
        return { zpl: this.zplRenderer.toZpl({ barcodes, layout: input.layout }) };
    }
}
