"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

const UNDO_WINDOW_MS = 5000;

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    const mutation = useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
    const removeWithUndo = (category: { id: string; name: string }) => {
        const snapshot = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
        queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) =>
            (categories ?? []).filter((item) => item.id !== category.id),
        );
        const timer = setTimeout(() => {
            mutation.mutate(category.id, {
                onError: () => queryClient.setQueryData(CATALOG_KEY, snapshot),
            });
        }, UNDO_WINDOW_MS);
        toast(`Categoria "${category.name}" excluída`, {
            duration: UNDO_WINDOW_MS,
            action: {
                label: "Desfazer",
                onClick: () => {
                    clearTimeout(timer);
                    queryClient.setQueryData(CATALOG_KEY, snapshot);
                },
            },
        });
    };
    return { removeWithUndo, isPending: mutation.isPending };
};
