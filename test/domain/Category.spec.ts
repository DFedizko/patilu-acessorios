import { describe, expect, it } from "bun:test";
import { Category } from "@/server/domain/entity/Category";
import { CategoryNameRequiredError } from "@/server/domain/error/CategoryNameRequiredError";

describe("Category", () => {
    describe("create", () => {
        it("creates a category with a valid name", () => {
            const category = Category.create("Canetas");

            expect(category.getName()).toBe("Canetas");
            expect(category.id).toBeTruthy();
        });

        it("trims the name on creation", () => {
            const category = Category.create("  Cadernos  ");

            expect(category.getName()).toBe("Cadernos");
        });

        it("throws CategoryNameRequiredError when name is empty", () => {
            expect(() => Category.create("")).toThrow(CategoryNameRequiredError);
        });

        it("throws CategoryNameRequiredError when name is whitespace only", () => {
            expect(() => Category.create("   ")).toThrow(CategoryNameRequiredError);
        });
    });

    describe("rename", () => {
        it("renames the category to a valid name", () => {
            const category = Category.create("Canetas");

            category.rename("Estojos");

            expect(category.getName()).toBe("Estojos");
        });

        it("throws CategoryNameRequiredError when renaming to empty name", () => {
            const category = Category.create("Canetas");

            expect(() => category.rename("")).toThrow(CategoryNameRequiredError);
        });

        it("throws CategoryNameRequiredError when renaming to whitespace only", () => {
            const category = Category.create("Canetas");

            expect(() => category.rename("   ")).toThrow(CategoryNameRequiredError);
        });
    });

    describe("restore", () => {
        it("restores a category from persisted data", () => {
            const id = "some-persisted-id";
            const createdAt = new Date("2024-01-01");
            const updatedAt = new Date("2024-01-02");

            const category = Category.restore({ id, name: "Canetas", createdAt, updatedAt });

            expect(category.id).toBe(id);
            expect(category.getName()).toBe("Canetas");
            expect(category.getCreatedAt()).toBe(createdAt);
        });
    });
});
