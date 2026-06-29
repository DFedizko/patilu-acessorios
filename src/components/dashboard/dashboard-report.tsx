"use client";

import { useState } from "react";
import type { Period } from "@/utils/types";
import { useDashboard } from "@/hooks/query/use-dashboard";
import { PeriodTabs } from "@/components/ui/period-tabs";
import { CustomDateRange } from "@/components/ui/custom-date-range";
import { DashboardMetricCards } from "@/components/dashboard/dashboard-metric-cards";
import { MarginChartPanel } from "@/components/dashboard/margin-chart-panel";
import { CategoryCostPanel } from "@/components/dashboard/category-cost-panel";
import { ManualAdSpendForm } from "@/components/ad-spend/manual-ad-spend-form";

export const DashboardReport = () => {
    const [period, setPeriod] = useState<Period>("week");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");
    const { data, isLoading } = useDashboard({ period, from: customStart || undefined, to: customEnd || undefined });
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
                    {!data.adsAvailable && <ManualAdSpendForm from={customStart || undefined} />}
                    <DashboardMetricCards data={data} />
                    <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                        <MarginChartPanel marginSeries={data.marginSeries} />
                        <CategoryCostPanel costByCategory={data.costByCategory} />
                    </div>
                </>
            )}
        </>
    );
};
