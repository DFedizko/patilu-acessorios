"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { cancelCatalog, restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";
import type { ApiCategory } from "@/service/category-service";

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (name: string) => service.create({ name }),
        onMutate: async (name) => {
            await cancelCatalog(queryClient);
            const previous = snapshotCatalog(queryClient);
            const optimisticId = `optimistic-${Date.now()}`;
            const optimistic: ApiCategory = { id: optimisticId, name, tiers: [] };
            updateCatalog(queryClient, (categories) => [...categories, optimistic]);
            return { previous, optimisticId };
        },
        onSuccess: (created, _name, context) => {
            updateCatalog(queryClient, (categories) =>
                categories.map((category) =>
                    category.id === context.optimisticId
                        ? { id: created.id, name: created.name, tiers: category.tiers }
                        : category,
                ),
            );
            toast.success(`Categoria "${_name}" criada`);
        },
        onError: (_error, _name, context) => {
            if (context) restoreCatalog(queryClient, context.previous);
        },
    });
};
