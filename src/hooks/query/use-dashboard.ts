"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { frontContainer } from "@/di/container";
import type { Period } from "@/utils/types";

export type DashboardQueryParams = {
    period: Period;
    from?: string;
    to?: string;
};

export const dashboardQueryKey = (period: Period, from?: string, to?: string) =>
    ["dashboard", period, from, to] as const;

export const useDashboard = (params: DashboardQueryParams) => {
    const service = frontContainer.getReportService();
    return useQuery({
        queryKey: dashboardQueryKey(params.period, params.from, params.to),
        queryFn: () => service.getDashboard(params),
        placeholderData: keepPreviousData,
        enabled: params.period !== "custom" || (!!params.from && !!params.to),
    });
};
