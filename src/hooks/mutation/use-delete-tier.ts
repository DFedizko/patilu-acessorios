"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { resolveMessage } from "@/lib/error-messages";
import { restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";

export const useDeleteTier = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getTierService();
    const remove = (tier: { id: string; name: string }) => {
        const snapshot = snapshotCatalog(queryClient);
        updateCatalog(queryClient, (categories) =>
            categories.map((category) => ({
                ...category,
                tiers: category.tiers.filter((item) => item.id !== tier.id),
            })),
        );
        service
            .remove(tier.id)
            .then(() => toast.success(`Faixa "${tier.name}" excluída`))
            .catch((error) => {
                restoreCatalog(queryClient, snapshot);
                toast.error(resolveMessage(error));
            });
    };
    return { remove };
};
