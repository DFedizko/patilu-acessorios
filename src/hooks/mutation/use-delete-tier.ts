"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";
import type { ApiCategory } from "@/service/category-service";

const UNDO_WINDOW_MS = 5000;

export const useDeleteTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    const mutation = useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSettled: () => queryClient.invalidateQueries({ queryKey: CATALOG_KEY }),
    });
    const removeWithUndo = (tier: { id: string; name: string }) => {
        const snapshot = queryClient.getQueryData<ApiCategory[]>(CATALOG_KEY);
        queryClient.setQueryData<ApiCategory[]>(CATALOG_KEY, (categories) =>
            (categories ?? []).map((category) => ({
                ...category,
                tiers: category.tiers.filter((item) => item.id !== tier.id),
            })),
        );
        const timer = setTimeout(() => {
            mutation.mutate(tier.id, {
                onError: () => queryClient.setQueryData(CATALOG_KEY, snapshot),
            });
        }, UNDO_WINDOW_MS);
        toast(`Faixa "${tier.name}" excluída`, {
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
