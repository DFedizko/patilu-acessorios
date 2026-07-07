import { Shimmer } from "@/components/ui/shimmer";
import { Button } from "@/components/ui/button";

export const AdsInvestmentPanelSkeleton = () => (
    <section className="flex flex-wrap items-end gap-4.5 panel px-4.5 py-4">
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Total de ads no período</span>
            <Shimmer width="7rem" height="1.875rem" />
        </div>
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">CPA médio por pedido</span>
            <Shimmer width="7rem" height="1.875rem" />
        </div>
        <div className="flex-1" />
        <Button disabled className="px-5 py-3.25 text-sm">
            Exportar para Excel
        </Button>
    </section>
);
