import { PackingInitializer } from "@/components/pack/packing-initializer";
import { OrderHeader } from "@/components/pack/order-header";
import { PackingToolbar } from "@/components/pack/packing-toolbar";
import { TierCatalog } from "@/components/pack/tier-catalog";
import { PackingSummaryBar } from "@/components/pack/packing-summary-bar";
import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";

interface EmpacotarPageProps {
    params: Promise<{ orderId: string }>;
}

export default async function EmpacotarPage({ params }: EmpacotarPageProps) {
    const { orderId } = await params;
    return (
        <>
            <PageHeader title="Empacotamento" subtitle="Conte as faixas e conclua o empacotamento" />
            <PageContent>
                <PackingInitializer orderId={orderId} />
                <OrderHeader orderId={orderId} />
                <PackingToolbar />
                <TierCatalog />
                <PackingSummaryBar orderId={orderId} />
            </PageContent>
        </>
    );
}
