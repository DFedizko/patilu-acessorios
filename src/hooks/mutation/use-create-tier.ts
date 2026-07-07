"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { cancelCatalog, restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";
import type { ApiCategory, ApiTier } from "@/service/category-service";

type CreateTierInput = {
    categoryId: string | null;
    name: string;
    costReais: number;
};

const appendOptimisticTier = (
    categories: ApiCategory[],
    input: CreateTierInput,
    optimisticId: string,
): ApiCategory[] => {
    const optimistic: ApiTier = {
        id: optimisticId,
        name: input.name,
        costCents: Math.round(input.costReais * 100),
        barcode: "…",
        categoryId: input.categoryId,
    };
    return categories.map((category) =>
        category.id === input.categoryId ? { ...category, tiers: [...category.tiers, optimistic] } : category,
    );
};

const replaceOptimisticTier = (categories: ApiCategory[], optimisticId: string, created: ApiTier): ApiCategory[] =>
    categories.map((category) => ({
        ...category,
        tiers: category.tiers.map((tier) => (tier.id === optimisticId ? created : tier)),
    }));

export const useCreateTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    return useMutation({
        mutationFn: ({ categoryId, name, costReais }: CreateTierInput) =>
            categoryId
                ? service.createInCategory({ categoryId, name, costReais })
                : service.createUncategorized({ name, costReais }),
        onMutate: async (input) => {
            await cancelCatalog(queryClient);
            const previous = snapshotCatalog(queryClient);
            const optimisticId = `optimistic-${Date.now()}`;
            updateCatalog(queryClient, (categories) => appendOptimisticTier(categories, input, optimisticId));
            return { previous, optimisticId };
        },
        onSuccess: (created, _input, context) => {
            updateCatalog(queryClient, (categories) =>
                replaceOptimisticTier(categories, context.optimisticId, created),
            );
            toast.success("Faixa criada");
        },
        onError: (_error, _input, context) => {
            if (context) restoreCatalog(queryClient, context.previous);
        },
    });
};
