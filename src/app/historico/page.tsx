import { HistoryReport } from "@/components/history/history-report";
import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";

export default function Page() {
    return (
        <>
            <PageHeader title="Histórico" subtitle="Pedidos com CPA, custo fixo e margem líquida" />
            <PageContent>
                <HistoryReport />
            </PageContent>
        </>
    );
}
