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
                onClick={() => onChange(key)}
                className={`cursor-pointer rounded-full border px-3.75 py-2 text-[0.8125rem] font-semibold ${
                    value === key ? "border-primary bg-primary text-white" : "border-field-line bg-field text-muted"
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);
