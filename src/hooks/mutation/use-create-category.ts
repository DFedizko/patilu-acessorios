"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (name: string) => service.create({ name }),
        onMutate: async (name) => {
            await queryClient.cancelQueries({ queryKey: CATALOG_KEY });
            const previous = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
            const optimistic: ApiCategory = { id: `optimistic-${Date.now()}`, name, tiers: [] };
            queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) => [...(categories ?? []), optimistic]);
            return { previous };
        },
        onError: (_error, _name, context) => {
            if (context) queryClient.setQueryData(CATALOG_KEY, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
};
