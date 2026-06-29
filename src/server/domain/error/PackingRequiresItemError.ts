import { DomainError } from "@/server/domain/error/DomainError";

export class PackingRequiresItemError extends DomainError {
    constructor() {
        super("PACKING_REQUIRES_ITEM", 422, "Packing requires at least one item");
    }
}
