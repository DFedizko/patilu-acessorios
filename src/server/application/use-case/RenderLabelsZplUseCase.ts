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
        const blocks = input.items.map((item) =>
            this.zplRenderer.toZpl({
                barcode: tiersById.get(item.tierId)!.getBarcode().toString(),
                quantity: item.quantity,
                options: input.options,
            }),
        );
        return { zpl: blocks.join("\n") };
    }
}
