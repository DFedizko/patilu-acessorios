"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/query/use-dashboard";
import { usePersistedPeriod } from "@/hooks/use-persisted-period";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { DashboardMetricCards } from "@/components/dashboard/dashboard-metric-cards";
import { MarginChartPanel } from "@/components/dashboard/margin-chart-panel";
import { CategoryCostPanel } from "@/components/dashboard/category-cost-panel";
import { ManualAdSpendForm } from "@/components/ad-spend/manual-ad-spend-form";
import { DashboardMetricCardsSkeleton } from "@/components/dashboard/skeletons/dashboard-metric-cards-skeleton";
import { MarginChartPanelSkeleton } from "@/components/dashboard/skeletons/margin-chart-panel-skeleton";
import { CategoryCostPanelSkeleton } from "@/components/dashboard/skeletons/category-cost-panel-skeleton";

export const DashboardReport = () => {
    const [period, setPeriod] = usePersistedPeriod("dashboard:period", "week");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const { data, isLoading, isPlaceholderData } = useDashboard({
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
                    {!data.adsAvailable && <ManualAdSpendForm from={customStart || undefined} />}
                    <DashboardMetricCards data={data} />
                    <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                        <MarginChartPanel marginSeries={data.marginSeries} />
                        <CategoryCostPanel costByCategory={data.costByCategory} />
                    </div>
                </div>
            ) : (
                isLoading && (
                    <div role="status" aria-label="Carregando dashboard" className="contents">
                        <DashboardMetricCardsSkeleton />
                        <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                            <MarginChartPanelSkeleton />
                            <CategoryCostPanelSkeleton />
                        </div>
                    </div>
                )
            )}
        </>
    );
};
