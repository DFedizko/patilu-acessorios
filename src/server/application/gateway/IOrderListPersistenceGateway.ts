import type { Period } from "@/server/domain/value-object/Period";
import type { ShipmentStatus } from "@/server/domain/entity/Order";
import type { OrderListItem } from "@/lib/schemas";

export interface IOrderListPersistenceGateway {
    listByPeriod(period: Period, status?: ShipmentStatus): Promise<OrderListItem[]>;
}
