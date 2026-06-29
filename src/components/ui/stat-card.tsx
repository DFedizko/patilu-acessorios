interface StatCardProps {
    label: string;
    value: string;
    accentClass: string;
    big?: boolean;
}

export const StatCard = ({ label, value, accentClass, big = false }: StatCardProps) => (
    <div className={`panel-sm ${big ? "p-4.5" : "p-4"}`}>
        <div className="text-xs font-semibold text-muted">{label}</div>
        <div
            className={`mt-1.5 font-head font-bold tabular-nums ${big ? "text-[1.625rem]" : "text-2xl"} ${accentClass}`}
        >
            {value}
        </div>
    </div>
);
