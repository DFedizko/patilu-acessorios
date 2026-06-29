import { HistoryReport } from "@/components/history/history-report";

export default function HistoryPage() {
    return (
        <div className="flex flex-col gap-4.5">
            <div>
                <h2 className="m-0 font-head text-2xl font-bold text-ink">Histórico</h2>
                <p className="mt-1 mb-0 text-sm text-muted">Pedidos com CPA, custo fixo e margem líquida</p>
            </div>
            <HistoryReport />
        </div>
    );
}
