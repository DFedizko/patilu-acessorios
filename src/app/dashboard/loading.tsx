import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";
import { PeriodTabsSkeleton } from "@/components/ui/period-tabs-skeleton";
import { DashboardMetricCardsSkeleton } from "@/components/dashboard/skeletons/dashboard-metric-cards-skeleton";
import { MarginChartPanelSkeleton } from "@/components/dashboard/skeletons/margin-chart-panel-skeleton";
import { CategoryCostPanelSkeleton } from "@/components/dashboard/skeletons/category-cost-panel-skeleton";

export default function DashboardLoading() {
    return (
        <>
            <PageHeader title="Dashboard" subtitle="Desempenho das lives" />
            <PageContent>
                <div role="status" aria-label="Carregando dashboard" className="contents">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <PeriodTabsSkeleton />
                    </div>
                    <DashboardMetricCardsSkeleton />
                    <div className="grid grid-cols-[1.5fr_1fr] gap-4">
                        <MarginChartPanelSkeleton />
                        <CategoryCostPanelSkeleton />
                    </div>
                </div>
            </PageContent>
        </>
    );
}
