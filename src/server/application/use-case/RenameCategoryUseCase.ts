import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import type { IRenameCategoryUseCase, Input, Output } from "./contracts/IRenameCategoryUseCase";

@injectable()
export class RenameCategoryUseCase implements IRenameCategoryUseCase {
    constructor(
        @inject(SYMBOLS.CategoryRepository)
        private readonly categoryRepo: ICategoryRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const category = await this.categoryRepo.findById(input.id);
        category.rename(input.name);
        await this.categoryRepo.save(category);
        return { id: category.id, name: category.getName() };
    }
}
