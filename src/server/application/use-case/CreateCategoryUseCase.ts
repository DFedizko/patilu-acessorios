import "reflect-metadata";
import { injectable, inject } from "inversify";
import { SYMBOLS } from "@/server/di/symbols";
import { Category } from "@/server/domain/entity/Category";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import type { ICreateCategoryUseCase, Input, Output } from "./contracts/ICreateCategoryUseCase";

@injectable()
export class CreateCategoryUseCase implements ICreateCategoryUseCase {
    constructor(
        @inject(SYMBOLS.CategoryRepository)
        private readonly categoryRepo: ICategoryRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
        const category = Category.create(input.name);
        await this.categoryRepo.save(category);
        return { id: category.id, name: category.getName() };
    }
}
