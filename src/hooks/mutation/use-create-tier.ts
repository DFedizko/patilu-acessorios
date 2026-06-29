"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { CATALOG_KEY } from "@/hooks/query/use-catalog";

type CreateTierInput = {
    categoryId: string | null;
    name: string;
    costReais: number;
};

export const useCreateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: ({ categoryId, name, costReais }: CreateTierInput) =>
            categoryId
                ? service.createInCategory({ categoryId, name, costReais })
                : service.createUncategorized({ name, costReais }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
        },
    });
};
