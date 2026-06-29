import type { Packing } from "@/server/domain/entity/Packing";

export interface IPackingRepository {
    save(packing: Packing): Promise<Packing>;
    findByOrderId(orderId: string): Promise<Packing | null>;
    deleteByOrderId(orderId: string): Promise<void>;
}
