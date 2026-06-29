import type { Order } from "@/server/domain/entity/Order";

export interface IOrderRepository {
    upsert(order: Order): Promise<Order>;
    save(order: Order): Promise<Order>;
    findById(id: string): Promise<Order>;
    findByTiktokOrderId(tiktokOrderId: string): Promise<Order>;
}
