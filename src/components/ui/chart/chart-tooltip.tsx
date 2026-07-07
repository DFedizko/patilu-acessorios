export interface ChartTooltipItem {
    name: string;
    value: string;
    colorClass: string;
}

interface ChartTooltipProps {
    label: string;
    items: ChartTooltipItem[];
}

export const ChartTooltip = ({ label, items }: ChartTooltipProps) => (
    <div className="min-w-32 rounded-lg border border-border bg-surface px-3 py-2 shadow-pop">
        <div className="mb-1.5 text-xs font-semibold text-ink-muted">{label}</div>
        <div className="flex flex-col gap-1.5">
            {items.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span className={`size-2.5 rounded-sm ${item.colorClass}`} />
                    <span className="text-ink-muted">{item.name}</span>
                    <span className="ml-auto font-bold text-ink tabular-nums">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
);
