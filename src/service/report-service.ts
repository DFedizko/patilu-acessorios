import type { HttpClient } from "@/lib/http/http-client";
import type { DashboardData, HistoryRow, HistorySummary } from "@/lib/schemas";
import type { Period } from "@/utils/types";

export type HistoryParams = {
    period: Period;
    from?: string;
    to?: string;
};

export type HistoryResponse = {
    rows: HistoryRow[];
    summary: HistorySummary;
};

export type ReportService = {
    getHistory: (params: HistoryParams) => Promise<HistoryResponse>;
    getDashboard: (params: HistoryParams) => Promise<DashboardData>;
    exportHistoryUrl: (params: HistoryParams) => string;
};

export const createReportService = (http: HttpClient): ReportService => ({
    getHistory: (params) => http.get<HistoryResponse>("/history", { params }),
    getDashboard: (params) => http.get<DashboardData>("/dashboard", { params }),
    exportHistoryUrl: ({ period, from, to }) => {
        const entries: [string, string][] = [["period", period]];
        if (from) entries.push(["from", from]);
        if (to) entries.push(["to", to]);
        return `/api/history/export?${new URLSearchParams(entries).toString()}`;
    },
});
