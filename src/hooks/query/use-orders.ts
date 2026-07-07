"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { ListOrdersDTO } from "@/lib/schemas";
import type { Period } from "@/utils/types";

export const ordersQueryKey = (period: Period, from?: string, to?: string) => ["orders", period, from, to] as const;

export const useOrders = (params: ListOrdersDTO) => {
    const service = frontContainer.getOrderService();
    return useQuery({
        queryKey: ordersQueryKey(params.period as Period, params.from, params.to),
        queryFn: () => service.listByPeriod(params),
        placeholderData: keepPreviousData,
        enabled: params.period !== "custom" || (!!params.from && !!params.to),
    });
};
