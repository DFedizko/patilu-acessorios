"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { cancelCatalog, restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";
import type { ApiCategory } from "@/service/category-service";

type UpdateTierInput = {
    id: string;
    name?: string;
    costReais?: number;
};

const applyTierUpdate = (categories: ApiCategory[], input: UpdateTierInput): ApiCategory[] =>
    categories.map((category) => ({
        ...category,
        tiers: category.tiers.map((tier) =>
            tier.id === input.id
                ? {
                      ...tier,
                      name: input.name ?? tier.name,
                      costCents: input.costReais != null ? Math.round(input.costReais * 100) : tier.costCents,
                  }
                : tier,
        ),
    }));

export const useUpdateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: (input: UpdateTierInput) => service.update(input),
        onMutate: async (input) => {
            await cancelCatalog(queryClient);
            const previous = snapshotCatalog(queryClient);
            updateCatalog(queryClient, (categories) => applyTierUpdate(categories, input));
            return { previous };
        },
        onSuccess: () => {
            toast.success("Faixa atualizada");
        },
        onError: (_error, _input, context) => {
            if (context) restoreCatalog(queryClient, context.previous);
        },
    });
};
