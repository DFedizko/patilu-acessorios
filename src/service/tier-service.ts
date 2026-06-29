import type { HttpClient } from "@/lib/http/http-client";
import type { ApiTier } from "./category-service";

type CreateTierBody = { name: string; costReais: number };
type UpdateTierBody = { name?: string; costReais?: number };

export type TierService = {
    byBarcode: (code: string) => Promise<ApiTier>;
    createInCategory: (input: { categoryId: string } & CreateTierBody) => Promise<ApiTier>;
    createUncategorized: (input: CreateTierBody) => Promise<ApiTier>;
    update: (input: { id: string } & UpdateTierBody) => Promise<ApiTier>;
    remove: (id: string) => Promise<void>;
};

export const createTierService = (http: HttpClient): TierService => ({
    byBarcode: (code) => http.get<ApiTier>(`/tiers/by-barcode/${code}`),
    createInCategory: ({ categoryId, name, costReais }) =>
        http.post<ApiTier>(`/categories/${categoryId}/tiers`, { name, costReais }),
    createUncategorized: (input) => http.post<ApiTier>("/tiers", input),
    update: ({ id, ...body }) => http.patch<ApiTier>(`/tiers/${id}`, body),
    remove: (id) => http.delete<void>(`/tiers/${id}`),
});
