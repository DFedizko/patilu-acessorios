import type { Tier } from "@/server/domain/entity/Tier";

export interface ITierRepository {
    findById(id: string): Promise<Tier>;
    findByBarcode(barcode: string): Promise<Tier>;
    findAll(): Promise<Tier[]>;
    findByCategoryId(categoryId: string): Promise<Tier[]>;
    save(tier: Tier): Promise<void>;
    delete(id: string): Promise<void>;
}
