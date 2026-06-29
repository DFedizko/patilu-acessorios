import "reflect-metadata";
import { injectable, inject } from "inversify";
import type { ISavePackingUseCase, Input, Output } from "./contracts/ISavePackingUseCase";
import type { IOrderRepository } from "@/server/domain/repository/IOrderRepository";
import type { IPackingRepository } from "@/server/domain/repository/IPackingRepository";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import { Packing } from "@/server/domain/entity/Packing";
import { Money } from "@/server/domain/value-object/Money";
import { OrderCannotBePackedError } from "@/server/domain/error/OrderCannotBePackedError";
import { SYMBOLS } from "@/server/di/symbols";

const DEFAULT_CATEGORY_NAME = "Sem categoria";

@injectable()
export class SavePackingUseCase implements ISavePackingUseCase {
    constructor(
        @inject(SYMBOLS.OrderRepository) private readonly orderRepo: IOrderRepository,
        @inject(SYMBOLS.PackingRepository) private readonly packingRepo: IPackingRepository,
        @inject(SYMBOLS.TierRepository) private readonly tierRepo: ITierRepository,
        @inject(SYMBOLS.CategoryRepository) private readonly categoryRepo: ICategoryRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const order = await this.orderRepo.findById(input.orderId);
        if (!order.canBePacked()) throw new OrderCannotBePackedError();
        const packing = Packing.create(input.orderId, input.operatorId);
        for (const item of input.items) {
            const tier = await this.tierRepo.findById(item.tierId);
            let categoryName = DEFAULT_CATEGORY_NAME;
            if (tier.getCategoryId()) {
                const category = await this.categoryRepo.findById(tier.getCategoryId()!);
                categoryName = category.getName();
            }
            packing.addTier({
                tierId: tier.getId(),
                tierName: tier.getName(),
                categoryName,
                unitCostCents: tier.getCost().toCents(),
            });
            for (let i = 1; i < item.quantity; i++) {
                packing.incrementTier(tier.getId());
            }
        }
        for (const looseItem of input.looseItems) {
            packing.addLooseItem(looseItem.name, Money.fromReais(looseItem.costReais));
        }
        packing.ensureCanConclude();
        order.markPacked();
        await this.packingRepo.save(packing);
        await this.orderRepo.save(order);
        return packing;
    }
}
