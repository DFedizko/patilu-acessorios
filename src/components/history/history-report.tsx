"use client";

import { useState } from "react";
import type { Period } from "@/utils/types";
import { useHistory } from "@/hooks/query/use-history";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { AdsInvestmentPanel } from "@/components/history/ads-investment-panel";
import { HistorySummaryCards } from "@/components/history/history-summary-cards";
import { HistoryTable } from "@/components/history/history-table";

export const HistoryReport = () => {
    const [period, setPeriod] = useState<Period>("today");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const { data, isLoading } = useHistory({ period, from: customStart || undefined, to: customEnd || undefined });
    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PeriodTabs value={period} onChange={setPeriod} />
            </div>
            {period === "custom" && (
                <CustomDateRange start={customStart} end={customEnd} onStart={setCustomStart} onEnd={setCustomEnd} />
            )}
            {!isLoading && data && (
                <>
                    <AdsInvestmentPanel
                        period={period}
                        from={customStart || undefined}
                        to={customEnd || undefined}
                        totalAdsCents={data.summary.totalAdsCents}
                        orderCount={data.summary.orderCount}
                    />
                    <HistorySummaryCards summary={data.summary} />
                    <HistoryTable rows={data.rows} />
                </>
            )}
        </>
    );
};
