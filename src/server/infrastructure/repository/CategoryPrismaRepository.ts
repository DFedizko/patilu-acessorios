import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { Category as PrismaCategory } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { Category } from "@/server/domain/entity/Category";
import { SYMBOLS } from "@/server/di/symbols";
import type { ICategoryRepository } from "@/server/domain/repository/ICategoryRepository";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

@injectable()
export class CategoryPrismaRepository implements ICategoryRepository {
    constructor(@inject(SYMBOLS.PrismaClient) private readonly prisma: PrismaClient) {}

    async findById(id: string): Promise<Category> {
        const record = await this.prisma.category.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundError(`Category not found: ${id}`, "CATEGORY_NOT_FOUND");
        }
        return this.mapToEntity(record);
    }

    async findAll(): Promise<Category[]> {
        const records = await this.prisma.category.findMany({ orderBy: { name: "asc" } });
        return records.map((r) => this.mapToEntity(r));
    }

    async save(category: Category): Promise<void> {
        await this.prisma.category.upsert({
            where: { id: category.id.value },
            create: {
                id: category.id.value,
                name: category.getName(),
                createdAt: category.getCreatedAt(),
            },
            update: {
                name: category.getName(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        const record = await this.prisma.category.findUnique({ where: { id } });
        if (!record) {
            throw new NotFoundError(`Category not found: ${id}`, "CATEGORY_NOT_FOUND");
        }
        await this.prisma.category.delete({ where: { id } });
    }

    private mapToEntity(record: PrismaCategory): Category {
        return Category.restore({
            id: record.id,
            name: record.name,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    }
}
