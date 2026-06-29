"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";

type UpdateTierInput = {
    id: string;
    name?: string;
    costReais?: number;
};

export const useUpdateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: (input: UpdateTierInput) => service.update(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
        },
    });
};
