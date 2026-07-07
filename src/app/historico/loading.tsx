import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";
import { PeriodTabsSkeleton } from "@/components/ui/period-tabs-skeleton";
import { AdsInvestmentPanelSkeleton } from "@/components/history/skeletons/ads-investment-panel-skeleton";
import { HistorySummaryCardsSkeleton } from "@/components/history/skeletons/history-summary-cards-skeleton";
import { HistoryTableSkeleton } from "@/components/history/skeletons/history-table-skeleton";

export default function HistoryLoading() {
    return (
        <>
            <PageHeader title="Histórico" subtitle="Pedidos com CPA, custo fixo e margem líquida" />
            <PageContent>
                <div role="status" aria-label="Carregando histórico" className="contents">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <PeriodTabsSkeleton />
                    </div>
                    <AdsInvestmentPanelSkeleton />
                    <HistorySummaryCardsSkeleton />
                    <HistoryTableSkeleton />
                </div>
            </PageContent>
        </>
    );
}
