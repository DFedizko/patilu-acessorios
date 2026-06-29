import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ITierRepository } from "@/server/domain/repository/ITierRepository";
import type { IDeleteTierUseCase, Input } from "./contracts/IDeleteTierUseCase";

@injectable()
export class DeleteTierUseCase implements IDeleteTierUseCase {
    constructor(
        @inject(SYMBOLS.TierRepository)
        private readonly tierRepo: ITierRepository,
    ) {}

    async execute(input: Input): Promise<void> {
        await this.tierRepo.delete(input.id);
    }
}
