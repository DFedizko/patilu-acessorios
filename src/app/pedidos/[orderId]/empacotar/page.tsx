import { PackingInitializer } from "@/components/pack/packing-initializer";
import { OrderHeader } from "@/components/pack/order-header";
import { PackingToolbar } from "@/components/pack/packing-toolbar";
import { TierCatalog } from "@/components/pack/tier-catalog";
import { PackingSummaryBar } from "@/components/pack/packing-summary-bar";

interface EmpacoarPageProps {
    params: Promise<{ orderId: string }>;
}

export default async function EmpacoarPage({ params }: EmpacoarPageProps) {
    const { orderId } = await params;
    return (
        <div className="flex flex-col gap-4.5">
            <div>
                <h2 className="m-0 font-head text-2xl font-bold text-ink">Empacotamento</h2>
                <p className="mt-1 mb-0 text-sm text-muted">Conte as faixas e conclua o empacotamento</p>
            </div>
            <PackingInitializer orderId={orderId} />
            <OrderHeader orderId={orderId} />
            <PackingToolbar />
            <TierCatalog />
            <PackingSummaryBar orderId={orderId} />
        </div>
    );
}
