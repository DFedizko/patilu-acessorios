import type { DashboardData } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/utils/format";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardMetricCardsProps {
    data: DashboardData;
}

export const DashboardMetricCards = ({ data }: DashboardMetricCardsProps) => {
    const cards = [
        { label: "Receita", value: formatCurrency(data.revenueCents / 100), accentClass: "text-primary" },
        { label: "Custo", value: formatCurrency(data.costCents / 100), accentClass: "text-accent" },
        { label: "Ads", value: formatCurrency(data.adsCents / 100), accentClass: "text-ads" },
        { label: "Lucro líquido", value: formatCurrency(data.profitCents / 100), accentClass: "text-good" },
        { label: "Margem média", value: formatPercent(data.avgMarginPct), accentClass: "text-primary" },
        { label: "Kits", value: String(data.orderCount), accentClass: "text-muted" },
    ];
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-3">
            {cards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} accentClass={card.accentClass} big />
            ))}
        </div>
    );
};
