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
    <div className="min-w-32 rounded-xl border border-line bg-white px-3 py-2 shadow-[0_0.5rem_1.5rem_rgba(20,12,40,0.18)]">
        <div className="mb-1.5 text-[0.6875rem] font-semibold text-muted">{label}</div>
        <div className="flex flex-col gap-1.5">
            {items.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[0.8125rem]">
                    <span className={`size-2.5 rounded-sm ${item.colorClass}`} />
                    <span className="text-muted">{item.name}</span>
                    <span className="ml-auto font-bold text-ink tabular-nums">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
);
