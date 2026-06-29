import type { HttpClient } from "@/lib/http/http-client";
import type { SavePackingDTO } from "@/lib/schemas";

export type OrderForPacking = {
    id: string;
    orderNumber: string;
    recipientName: string | null;
    saleCents: number;
    shippingCents: number;
    shipmentStatus: string;
    packingStatus: string;
};

export type PackingItemResponse = {
    id: string;
    tierId: string | null;
    tierName: string;
    categoryName: string | null;
    unitCostCents: number;
    quantity: number;
};

export type PackingLooseItemResponse = {
    id: string;
    name: string;
    costCents: number;
};

export type PackingResponse = {
    id: string;
    orderId: string;
    operatorId: string;
    packedAt: string;
    items: PackingItemResponse[];
    looseItems: PackingLooseItemResponse[];
};

export type OrderPackingResponse = {
    order: OrderForPacking;
    packing: PackingResponse | null;
};

export type PackingService = {
    getForPacking: (orderId: string) => Promise<OrderPackingResponse>;
    save: (orderId: string, input: SavePackingDTO) => Promise<PackingResponse>;
    remove: (orderId: string) => Promise<void>;
};

export const createPackingService = (http: HttpClient): PackingService => ({
    getForPacking: (orderId) => http.get<OrderPackingResponse>(`/orders/${orderId}/packing`),
    save: (orderId, input) => http.put<PackingResponse, SavePackingDTO>(`/orders/${orderId}/packing`, input),
    remove: (orderId) => http.delete<void>(`/orders/${orderId}/packing`),
});
