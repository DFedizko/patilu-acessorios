"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { Period } from "@/utils/types";

export type AdSpendQueryParams = {
    period: Period;
    from?: string;
    to?: string;
};

export const adSpendQueryKey = (period: Period, from?: string, to?: string) => ["ad-spend", period, from, to] as const;

export const useAdSpend = (params: AdSpendQueryParams) => {
    const service = frontContainer.getAdSpendService();
    return useQuery({
        queryKey: adSpendQueryKey(params.period, params.from, params.to),
        queryFn: () => service.getAdSpend(params),
        enabled: params.period !== "custom" || (!!params.from && !!params.to),
    });
};
