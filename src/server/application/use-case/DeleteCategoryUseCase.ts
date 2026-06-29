import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import type { IDeleteCategoryUseCase, Input } from "./contracts/IDeleteCategoryUseCase";

@injectable()
export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {
    constructor(
        @inject(SYMBOLS.CategoryRepository)
        private readonly categoryRepo: ICategoryRepository,
    ) {}

    async execute(input: Input): Promise<void> {
        await this.categoryRepo.delete(input.id);
    }
}
