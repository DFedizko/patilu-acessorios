import type { Category } from "@/server/domain/entity/Category";

export interface ICategoryRepository {
    findById(id: string): Promise<Category>;
    findAll(): Promise<Category[]>;
    save(category: Category): Promise<void>;
    delete(id: string): Promise<void>;
}
