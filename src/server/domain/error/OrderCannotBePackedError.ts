import { DomainError } from "@/server/domain/error/DomainError";

export class OrderCannotBePackedError extends DomainError {
    constructor() {
        super("ORDER_CANNOT_BE_PACKED", 422, "Order cannot be packed in its current state");
    }
}
