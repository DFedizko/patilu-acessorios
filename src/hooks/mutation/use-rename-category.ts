"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { cancelCatalog, restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";

export const useRenameCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (input: { id: string; name: string }) => service.rename(input),
        onMutate: async (input) => {
            await cancelCatalog(queryClient);
            const previous = snapshotCatalog(queryClient);
            updateCatalog(queryClient, (categories) =>
                categories.map((category) => (category.id === input.id ? { ...category, name: input.name } : category)),
            );
            return { previous };
        },
        onSuccess: () => {
            toast.success("Categoria renomeada");
        },
        onError: (_error, _input, context) => {
            if (context) restoreCatalog(queryClient, context.previous);
        },
    });
};
