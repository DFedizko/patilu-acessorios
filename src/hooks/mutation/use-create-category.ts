"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    return useMutation({
        mutationFn: (name: string) => service.create({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
        },
    });
};
