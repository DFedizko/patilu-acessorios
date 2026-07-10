import type { FixedCosts } from "@/server/domain/value-object/FixedCosts";

export interface IFixedCostsGateway {
    get(): Promise<FixedCosts>;
    save(fixedCosts: FixedCosts): Promise<void>;
}
