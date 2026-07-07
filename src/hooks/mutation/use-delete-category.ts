"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { frontContainer } from "@/di/container";
import { resolveMessage } from "@/lib/error-messages";
import { restoreCatalog, snapshotCatalog, updateCatalog } from "@/lib/catalog-cache";

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    const service = frontContainer.getCategoryService();
    const remove = (category: { id: string; name: string }) => {
        const snapshot = snapshotCatalog(queryClient);
        updateCatalog(queryClient, (categories) => categories.filter((item) => item.id !== category.id));
        service
            .remove(category.id)
            .then(() => toast.success(`Categoria "${category.name}" excluída`))
            .catch((error) => {
                restoreCatalog(queryClient, snapshot);
                toast.error(resolveMessage(error));
            });
    };
    return { remove };
};
