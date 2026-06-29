import { describe, it, expect, beforeEach } from "bun:test";
import { testPrisma } from "../helpers/prisma";
import { truncateAll } from "../helpers/truncate";
import { CategoryPrismaRepository } from "@/server/infrastructure/repository/CategoryPrismaRepository";
import { CreateCategoryUseCase } from "@/server/application/use-case/CreateCategoryUseCase";
import { DomainError } from "@/server/domain/error/DomainError";

describe("CreateCategoryUseCase", () => {
    let createCategory: CreateCategoryUseCase;

    beforeEach(async () => {
        await truncateAll();
        const categoryRepo = new CategoryPrismaRepository(testPrisma);
        createCategory = new CreateCategoryUseCase(categoryRepo);
    });

    it("creates and persists a category with the given name", async () => {
        // Arrange — name to create

        // Act
        const result = await createCategory.execute({ name: "Canetas" });

        // Assert
        expect(result.id).toBeDefined();
        expect(result.name).toBe("Canetas");
        const saved = await testPrisma.category.findUnique({ where: { id: result.id } });
        expect(saved).not.toBeNull();
        expect(saved?.name).toBe("Canetas");
    });

    it("rejects empty name with CATEGORY_NAME_REQUIRED", async () => {
        // Arrange
        let thrown: unknown;

        // Act
        try {
            await createCategory.execute({ name: "" });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(DomainError);
        expect((thrown as DomainError).code).toBe("CATEGORY_NAME_REQUIRED");
        expect((thrown as DomainError).httpStatus).toBe(422);
    });
});
