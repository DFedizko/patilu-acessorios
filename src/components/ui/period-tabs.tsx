"use client";

import type { Period } from "@/utils/types";

const ITEMS: [Period, string][] = [
    ["today", "Hoje"],
    ["week", "Semana"],
    ["month", "Mês"],
    ["custom", "Personalizado"],
];

interface PeriodTabsProps {
    value: Period;
    onChange: (period: Period) => void;
}

export const PeriodTabs = ({ value, onChange }: PeriodTabsProps) => (
    <div className="flex flex-wrap gap-2">
        {ITEMS.map(([key, label]) => (
            <button
                key={key}
                suppressHydrationWarning
                onClick={() => onChange(key)}
                className={`cursor-pointer rounded-full border px-3.75 py-2 text-sm font-medium focus-ring transition-colors duration-150 ${
                    value === key
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-surface text-ink-muted hover:bg-hover hover:text-ink"
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);
