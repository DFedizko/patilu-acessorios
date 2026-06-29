import type { HttpClient } from "@/lib/http/http-client";
import type { ListOrdersDTO, OrderListItem } from "@/lib/schemas";

export type OrderService = {
    listByPeriod: (params: ListOrdersDTO) => Promise<OrderListItem[]>;
};

export const createOrderService = (http: HttpClient): OrderService => ({
    listByPeriod: (params) => http.get<OrderListItem[]>("/orders", { params }),
});
