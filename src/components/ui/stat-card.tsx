import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: ReactNode;
    accentClass: string;
    icon?: ReactNode;
    big?: boolean;
}

export const StatCard = ({ label, value, accentClass, icon, big = false }: StatCardProps) => (
    <div className={`panel ${big ? "p-5" : "p-4"}`}>
        <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-ink-muted">{label}</span>
            {icon ? <span className="text-ink-muted">{icon}</span> : null}
        </div>
        <span className={`mt-1.5 font-mono text-xl font-semibold tracking-tight tabular-nums ${accentClass}`}>
            {value}
        </span>
    </div>
);
