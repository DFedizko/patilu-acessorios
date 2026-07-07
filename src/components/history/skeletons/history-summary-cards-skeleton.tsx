import { Shimmer } from "@/components/ui/shimmer";

const SUMMARY_LABELS = ["Kits", "Receita", "Custo itens", "Imposto", "Ads", "Lucro líquido", "Margem média"];

export const HistorySummaryCardsSkeleton = () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(9.375rem,1fr))] gap-3">
        {SUMMARY_LABELS.map((label) => (
            <div key={label} className="panel p-4">
                <div className="text-sm text-ink-muted">{label}</div>
                <Shimmer className="mt-2" width="5.5rem" height="1.75rem" />
            </div>
        ))}
    </div>
);
