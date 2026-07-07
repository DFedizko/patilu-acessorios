import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";
import { PeriodTabsSkeleton } from "@/components/ui/period-tabs-skeleton";
import { OrdersTableSkeleton } from "@/components/orders/skeletons/orders-table-skeleton";

export default function PedidosLoading() {
    return (
        <>
            <PageHeader title="Pedidos" subtitle="Fila de pedidos do TikTok por período" />
            <PageContent>
                <div role="status" aria-label="Carregando pedidos" className="contents">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <PeriodTabsSkeleton />
                    </div>
                    <OrdersTableSkeleton />
                </div>
            </PageContent>
        </>
    );
}
