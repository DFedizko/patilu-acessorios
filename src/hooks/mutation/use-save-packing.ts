"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { orderPackingKey } from "@/hooks/query/use-order-packing";
import type { SavePackingDTO } from "@/lib/schemas";

export const useSavePacking = (orderId: string) => {
    const queryClient = useQueryClient();
    const service = frontContainer.getPackingService();
    return useMutation({
        mutationFn: (input: SavePackingDTO) => service.save(orderId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderPackingKey(orderId) });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["history"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
};
