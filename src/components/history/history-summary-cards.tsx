import type { HistorySummary } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/utils/format";
import { StatCard } from "@/components/ui/stat-card";

interface HistorySummaryCardsProps {
    summary: HistorySummary;
}

export const HistorySummaryCards = ({ summary }: HistorySummaryCardsProps) => {
    const cards = [
        { label: "Kits", value: String(summary.orderCount), accentClass: "text-ink" },
        { label: "Receita", value: formatCurrency(summary.revenueCents / 100), accentClass: "text-primary" },
        { label: "Custo itens", value: formatCurrency(summary.costCents / 100), accentClass: "text-accent" },
        { label: "Ads", value: formatCurrency(summary.totalAdsCents / 100), accentClass: "text-ads" },
        { label: "Lucro líquido", value: formatCurrency(summary.profitCents / 100), accentClass: "text-good" },
        { label: "Margem média", value: formatPercent(summary.avgMarginPct), accentClass: "text-primary" },
    ];
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-3">
            {cards.map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} accentClass={card.accentClass} />
            ))}
        </div>
    );
};
