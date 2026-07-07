"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

type UpdateTierInput = {
    id: string;
    name?: string;
    costReais?: number;
};

const applyTierUpdate = (categories: ApiCategory[] | undefined, input: UpdateTierInput): ApiCategory[] =>
    (categories ?? []).map((category) => ({
        ...category,
        tiers: category.tiers.map((tier) =>
            tier.id === input.id
                ? {
                      ...tier,
                      name: input.name ?? tier.name,
                      costCents: input.costReais != null ? Math.round(input.costReais * 100) : tier.costCents,
                  }
                : tier,
        ),
    }));

export const useUpdateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: (input: UpdateTierInput) => service.update(input),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: CATALOG_KEY });
            const previous = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
            queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) => applyTierUpdate(categories, input));
            return { previous };
        },
        onError: (_error, _input, context) => {
            if (context) queryClient.setQueryData(CATALOG_KEY, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
};
