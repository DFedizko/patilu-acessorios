"use client";

import { useState } from "react";
import { useHistory } from "@/hooks/query/use-history";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { AdsInvestmentPanel } from "@/components/history/ads-investment-panel";
import { HistorySummaryCards } from "@/components/history/history-summary-cards";
import { HistoryTable } from "@/components/history/history-table";
import { AdsInvestmentPanelSkeleton } from "@/components/history/skeletons/ads-investment-panel-skeleton";
import { HistorySummaryCardsSkeleton } from "@/components/history/skeletons/history-summary-cards-skeleton";
import { HistoryTableSkeleton } from "@/components/history/skeletons/history-table-skeleton";

export const HistoryReport = () => {
    const [period, setPeriod] = usePersistedPeriod("history:period", "today");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const { data, isLoading, isPlaceholderData } = useHistory({
        period,
        from: customStart || undefined,
        to: customEnd || undefined,
    });
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            {period === "custom" && (
                <CustomDateRange start={customStart} end={customEnd} onStart={setCustomStart} onEnd={setCustomEnd} />
            )}
            {data ? (
                <div
                    className={`flex flex-col gap-4.5 transition-opacity duration-150 ${isPlaceholderData ? "opacity-60" : ""}`}
                >
                    <AdsInvestmentPanel
                        period={period}
                        from={customStart || undefined}
                        to={customEnd || undefined}
                        totalAdsCents={data.summary.totalAdsCents}
                        orderCount={data.summary.orderCount}
                    />
                    <HistorySummaryCards summary={data.summary} />
                    <HistoryTable rows={data.rows} />
                </div>
            ) : (
                isLoading && (
                    <div role="status" aria-label="Carregando histórico" className="contents">
                        <AdsInvestmentPanelSkeleton />
                        <HistorySummaryCardsSkeleton />
                        <HistoryTableSkeleton />
                    </div>
                )
            )}
        </>
    );
};
