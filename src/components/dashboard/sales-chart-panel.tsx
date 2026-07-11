import type { DashboardData } from "@/lib/schemas";
import { formatCurrency } from "@/utils/format";
import { LineChart } from "@/components/ui/chart/line-chart";

interface SalesChartPanelProps {
    salesSeries: DashboardData["salesSeries"];
}

const SAO_PAULO = "America/Sao_Paulo";
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: SAO_PAULO, hour: "2-digit", minute: "2-digit" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    day: "2-digit",
    month: "2-digit",
});

export const SalesChartPanel = ({ salesSeries }: SalesChartPanelProps) => {
    const days = new Set(salesSeries.map((sale) => dayFormatter.format(new Date(sale.at))));
    const multiDay = days.size > 1;
    const labels = salesSeries.map((sale) => {
        const date = new Date(sale.at);
        return multiDay ? dateFormatter.format(date) : timeFormatter.format(date);
    });
    const series = [
        {
            name: "Venda",
            values: salesSeries.map((sale) => sale.saleCents / 100),
            stroke: "var(--color-primary)",
            colorClass: "bg-primary",
            fill: true,
        },
        {
            name: "Custo",
            values: salesSeries.map((sale) => sale.costCents / 100),
            stroke: "var(--color-brand-pink)",
            colorClass: "bg-brand-pink",
        },
    ];
    return (
        <div className="flex flex-col gap-3.5 panel p-5">
            <div className="text-sm font-semibold text-ink">Vendas no período</div>
            <div className="h-52.5 w-full">
                {salesSeries.length > 0 ? (
                    <LineChart labels={labels} series={series} formatValue={formatCurrency} />
                ) : (
                    <div className="flex size-full items-center justify-center text-sm text-ink-muted">
                        Sem vendas no período
                    </div>
                )}
            </div>
        </div>
    );
};
