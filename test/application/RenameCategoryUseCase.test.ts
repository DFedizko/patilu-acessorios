import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { CreateCategoryUseCase } from "@/server/application/use-case/CreateCategoryUseCase";
import { RenameCategoryUseCase } from "@/server/application/use-case/RenameCategoryUseCase";
import { DomainError } from "@/server/domain/error/DomainError";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("RenameCategoryUseCase", () => {
    let createCategory: CreateCategoryUseCase;
    let renameCategory: RenameCategoryUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        createCategory = new CreateCategoryUseCase(categoryRepo);
        renameCategory = new RenameCategoryUseCase(categoryRepo);
    });

    it("renames an existing category", async () => {
        // Arrange
        const created = await createCategory.execute({ name: "Canetas" });

        // Act
        const result = await renameCategory.execute({ id: created.id, name: "Cadernos" });

        // Assert
        expect(result.id).toBe(created.id);
        expect(result.name).toBe("Cadernos");
        const saved = await testPrisma.category.findUnique({ where: { id: created.id } });
        expect(saved?.name).toBe("Cadernos");
    });

    it("throws CATEGORY_NOT_FOUND when id does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await renameCategory.execute({ id: "non-existent-id", name: "Qualquer" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("CATEGORY_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });

    it("rejects empty name with CATEGORY_NAME_REQUIRED", async () => {
        // Arrange
        const created = await createCategory.execute({ name: "Canetas" });
        let thrown: unknown;

        // Act
        try {
            await renameCategory.execute({ id: created.id, name: "" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(DomainError);
        expect((thrown as DomainError).code).toBe("CATEGORY_NAME_REQUIRED");
        expect((thrown as DomainError).httpStatus).toBe(422);
    });
});
