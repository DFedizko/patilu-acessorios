import { Shimmer } from "@/components/ui/shimmer";

const METRIC_LABELS = ["Kits", "Receita", "Custo", "Ads", "Lucro líquido", "Margem média"];

export const DashboardMetricCardsSkeleton = () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-3">
        {METRIC_LABELS.map((label) => (
            <div key={label} className="panel p-5">
                <div className="text-sm text-ink-muted">{label}</div>
                <Shimmer className="mt-2" width="6rem" height="1.75rem" />
            </div>
        ))}
    </div>
);
