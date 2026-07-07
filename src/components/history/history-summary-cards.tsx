import type { ReactNode } from "react";
import type { HistorySummary } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/utils/format";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { moneyToneClass } from "@/utils/money-tone";
import { PackageIcon } from "@/components/ui/icons/package-icon";
import { BanknoteIcon } from "@/components/ui/icons/banknote-icon";
import { CoinsIcon } from "@/components/ui/icons/coins-icon";
import { ReceiptIcon } from "@/components/ui/icons/receipt-icon";
import { MegaphoneIcon } from "@/components/ui/icons/megaphone-icon";
import { TrendingUpIcon } from "@/components/ui/icons/trending-up-icon";
import { PercentIcon } from "@/components/ui/icons/percent-icon";

interface HistorySummaryCardsProps {
    summary: HistorySummary;
}

interface SummaryCard {
    label: string;
    value: number;
    format: (value: number) => string;
    accentClass: string;
    icon: ReactNode;
}

const formatCount = (value: number) => String(Math.round(value));

export const HistorySummaryCards = ({ summary }: HistorySummaryCardsProps) => {
    const cards: SummaryCard[] = [
        {
            label: "Kits",
            value: summary.orderCount,
            format: formatCount,
            accentClass: "text-ink",
            icon: <PackageIcon />,
        },
        {
            label: "Receita",
            value: summary.revenueCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <BanknoteIcon />,
        },
        {
            label: "Custo itens",
            value: summary.costCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <CoinsIcon />,
        },
        {
            label: "Imposto",
            value: summary.taxCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <ReceiptIcon />,
        },
        {
            label: "Ads",
            value: summary.totalAdsCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <MegaphoneIcon />,
        },
        {
            label: "Lucro líquido",
            value: summary.profitCents / 100,
            format: formatCurrency,
            accentClass: moneyToneClass(summary.profitCents),
            icon: <TrendingUpIcon />,
        },
        {
            label: "Margem média",
            value: summary.avgMarginPct,
            format: formatPercent,
            accentClass: moneyToneClass(summary.avgMarginPct),
            icon: <PercentIcon />,
        },
    ];
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-3">
            {cards.map((card) => (
                <StatCard
                    key={card.label}
                    label={card.label}
                    accentClass={card.accentClass}
                    icon={card.icon}
                    value={<AnimatedNumber value={card.value} format={card.format} />}
                />
            ))}
        </div>
    );
};
