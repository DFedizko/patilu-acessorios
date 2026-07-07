import { DashboardReport } from "@/components/dashboard/dashboard-report";
import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";

export default function Page() {
    return (
        <>
            <PageHeader title="Dashboard" subtitle="Desempenho das lives" />
            <PageContent>
                <DashboardReport />
            </PageContent>
        </>
    );
}
