import { DashboardReport } from "@/components/dashboard/dashboard-report";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-4.5">
            <div>
                <h2 className="m-0 font-head text-2xl font-bold text-ink">Dashboard</h2>
                <p className="mt-1 mb-0 text-sm text-muted">Desempenho das lives</p>
            </div>
            <DashboardReport />
        </div>
    );
}
