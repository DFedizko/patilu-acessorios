import type { ReactNode } from "react";
import type { DashboardData } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/utils/format";
import { StatCard } from "@/components/ui/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { moneyToneClass } from "@/utils/money-tone";
import { PackageIcon } from "@/components/ui/icons/package-icon";
import { BanknoteIcon } from "@/components/ui/icons/banknote-icon";
import { CoinsIcon } from "@/components/ui/icons/coins-icon";
import { MegaphoneIcon } from "@/components/ui/icons/megaphone-icon";
import { TrendingUpIcon } from "@/components/ui/icons/trending-up-icon";
import { PercentIcon } from "@/components/ui/icons/percent-icon";

interface DashboardMetricCardsProps {
    data: DashboardData;
}

interface MetricCard {
    label: string;
    value: number;
    format: (value: number) => string;
    accentClass: string;
    icon: ReactNode;
}

const formatCount = (value: number) => String(Math.round(value));

export const DashboardMetricCards = ({ data }: DashboardMetricCardsProps) => {
    const cards: MetricCard[] = [
        {
            label: "Kits",
            value: data.orderCount,
            format: formatCount,
            accentClass: "text-ink",
            icon: <PackageIcon />,
        },
        {
            label: "Receita",
            value: data.revenueCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <BanknoteIcon />,
        },
        {
            label: "Custo",
            value: (data.costCents + data.fixedTotalCents) / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <CoinsIcon />,
        },
        {
            label: "Ads",
            value: data.adsCents / 100,
            format: formatCurrency,
            accentClass: "text-ink",
            icon: <MegaphoneIcon />,
        },
        {
            label: "Lucro líquido",
            value: data.profitCents / 100,
            format: formatCurrency,
            accentClass: moneyToneClass(data.profitCents),
            icon: <TrendingUpIcon />,
        },
        {
            label: "Margem média",
            value: data.avgMarginPct,
            format: formatPercent,
            accentClass: moneyToneClass(data.avgMarginPct),
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
                    big
                />
            ))}
        </div>
    );
};
