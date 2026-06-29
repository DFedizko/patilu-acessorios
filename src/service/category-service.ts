import type { HttpClient } from "@/lib/http/http-client";

export type ApiTier = {
    id: string;
    name: string;
    costCents: number;
    barcode: string;
    categoryId: string | null;
};

export type ApiCategory = {
    id: string | null;
    name: string;
    tiers: ApiTier[];
};

export type CategoryService = {
    list: () => Promise<ApiCategory[]>;
    create: (input: { name: string }) => Promise<ApiCategory>;
    rename: (input: { id: string; name: string }) => Promise<ApiCategory>;
    remove: (id: string) => Promise<void>;
};

export const createCategoryService = (http: HttpClient): CategoryService => ({
    list: () => http.get<ApiCategory[]>("/categories"),
    create: (input) => http.post<ApiCategory>("/categories", input),
    rename: ({ id, name }) => http.patch<ApiCategory>(`/categories/${id}`, { name }),
    remove: (id) => http.delete<void>(`/categories/${id}`),
});
