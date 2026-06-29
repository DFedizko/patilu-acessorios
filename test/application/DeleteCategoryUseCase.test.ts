import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { givenTier } from "../helpers/builders";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { CreateCategoryUseCase } from "@/server/application/use-case/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/server/application/use-case/DeleteCategoryUseCase";
import { NotFoundError } from "@/server/infrastructure/errors/NotFoundError";

describe("DeleteCategoryUseCase", () => {
    let createCategory: CreateCategoryUseCase;
    let deleteCategory: DeleteCategoryUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        createCategory = new CreateCategoryUseCase(categoryRepo);
        deleteCategory = new DeleteCategoryUseCase(categoryRepo);
    });

    it("removes the category and moves its tiers to Sem categoria (categoryId = null)", async () => {
        // Arrange
        const category = await createCategory.execute({ name: "Canetas" });
        const tier = await givenTier({ categoryId: category.id });

        // Act
        await deleteCategory.execute({ id: category.id });

        // Assert — category is gone
        const deletedCategory = await testPrisma.category.findUnique({ where: { id: category.id } });
        expect(deletedCategory).toBeNull();

        // Assert — tier still exists with categoryId = null
        const updatedTier = await testPrisma.tier.findUnique({ where: { id: tier.id } });
        expect(updatedTier).not.toBeNull();
        expect(updatedTier?.categoryId).toBeNull();
    });

    it("throws CATEGORY_NOT_FOUND when id does not exist", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await deleteCategory.execute({ id: "non-existent-id" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(NotFoundError);
        expect((thrown as NotFoundError).code).toBe("CATEGORY_NOT_FOUND");
        expect((thrown as NotFoundError).httpStatus).toBe(404);
    });
});
