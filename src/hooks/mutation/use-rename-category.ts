"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

export const useRenameCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (input: { id: string; name: string }) => service.rename(input),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: CATALOG_KEY });
            const previous = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
            queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) =>
                (categories ?? []).map((category) =>
                    category.id === input.id ? { ...category, name: input.name } : category,
                ),
            );
            return { previous };
        },
        onError: (_error, _input, context) => {
            if (context) queryClient.setQueryData(CATALOG_KEY, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
};
