"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import { orderPackingKey } from "@/hooks/query/use-order-packing";

export const useDeletePacking = (orderId: string) => {
    const queryClient = useQueryClient();
    const service = frontContainer.getPackingService();
    return useMutation({
        mutationFn: (): Promise<void> => service.remove(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderPackingKey(orderId) });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};
