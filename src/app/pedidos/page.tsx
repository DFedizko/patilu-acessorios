import { OrdersIsland } from "./orders-island";
import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";

export default function Page() {
    return (
        <>
            <PageHeader title="Pedidos" subtitle="Fila de pedidos do TikTok por período" />
            <PageContent>
                <OrdersIsland />
            </PageContent>
        </>
    );
}
