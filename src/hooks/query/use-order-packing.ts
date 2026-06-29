"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";

export const orderPackingKey = (orderId: string) => ["order-packing", orderId] as const;

export const useOrderPacking = (orderId: string) => {
    const service = frontContainer.getPackingService();
    return useQuery({
        queryKey: orderPackingKey(orderId),
        queryFn: () => service.getForPacking(orderId),
    });
};
