"use client";

import { useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { Period } from "@/utils/types";

export type HistoryQueryParams = {
    period: Period;
    from?: string;
    to?: string;
};

export const historyQueryKey = (period: Period, from?: string, to?: string) => ["history", period, from, to] as const;

export const useHistory = (params: HistoryQueryParams) => {
    const service = frontContainer.getReportService();
    return useQuery({
        queryKey: historyQueryKey(params.period, params.from, params.to),
        queryFn: () => service.getHistory(params),
        enabled: params.period !== "custom" || (!!params.from && !!params.to),
    });
};
