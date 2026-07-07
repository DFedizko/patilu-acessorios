import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";
import { OrderHeaderSkeleton } from "@/components/pack/skeletons/order-header-skeleton";
import { PackingToolbarSkeleton } from "@/components/pack/skeletons/packing-toolbar-skeleton";
import { TierCatalogSkeleton } from "@/components/pack/skeletons/tier-catalog-skeleton";
import { PackingSummaryBarSkeleton } from "@/components/pack/skeletons/packing-summary-bar-skeleton";

export default function EmpacotarLoading() {
    return (
        <>
            <PageHeader title="Empacotamento" subtitle="Conte as faixas e conclua o empacotamento" />
            <PageContent>
                <div role="status" aria-label="Carregando empacotamento" className="contents">
                    <OrderHeaderSkeleton />
                    <PackingToolbarSkeleton />
                    <TierCatalogSkeleton />
                    <PackingSummaryBarSkeleton />
                </div>
            </PageContent>
        </>
    );
}
