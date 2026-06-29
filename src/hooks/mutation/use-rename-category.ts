"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";

export const useRenameCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (input: { id: string; name: string }) => service.rename(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
        },
    });
};
