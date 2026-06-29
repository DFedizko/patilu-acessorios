import { DomainError } from "@/server/domain/error/DomainError";

export class CategoryNameRequiredError extends DomainError {
    constructor() {
        super("CATEGORY_NAME_REQUIRED", 422, "Category name is required");
    }
}
