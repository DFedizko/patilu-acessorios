import { DomainError } from "@/server/domain/error/DomainError";

export class TierCostMustBePositiveError extends DomainError {
    constructor() {
        super("TIER_COST_MUST_BE_POSITIVE", 422, "Tier cost must be positive");
    }
}
