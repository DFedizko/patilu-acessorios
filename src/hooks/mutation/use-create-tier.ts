"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory, ApiTier } from "@/service/category-service";

type CreateTierInput = {
    categoryId: string | null;
    name: string;
    costReais: number;
};

const appendOptimisticTier = (categories: ApiCategory[] | undefined, input: CreateTierInput): ApiCategory[] => {
    const optimistic: ApiTier = {
        id: `optimistic-${Date.now()}`,
        name: input.name,
        costCents: Math.round(input.costReais * 100),
        barcode: "…",
        categoryId: input.categoryId,
    };
    return (categories ?? []).map((category) =>
        category.id === input.categoryId ? { ...category, tiers: [...category.tiers, optimistic] } : category,
    );
};

export const useCreateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: ({ categoryId, name, costReais }: CreateTierInput) =>
            categoryId
                ? service.createInCategory({ categoryId, name, costReais })
                : service.createUncategorized({ name, costReais }),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: CATALOG_KEY });
            const previous = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
            queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) =>
                appendOptimisticTier(categories, input),
            );
            return { previous };
        },
        onError: (_error, _input, context) => {
            if (context) queryClient.setQueryData(CATALOG_KEY, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
};
