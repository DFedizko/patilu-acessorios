"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";

export const useDeleteTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
        },
    });
};
