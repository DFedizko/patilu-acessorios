import { Shimmer } from "@/components/ui/shimmer";
import { Button } from "@/components/ui/button";

export const PackingSummaryBarSkeleton = () => (
    <footer className="sticky bottom-0 z-20 mt-1.5 flex items-center gap-6 floating-bar px-5 py-3.5">
        <div className="flex flex-wrap gap-6">
            <div>
                <div className="text-xs font-medium text-ink-muted">Custo dos itens</div>
                <Shimmer className="mt-1" width="4.5rem" height="1.25rem" />
            </div>
            <div>
                <div className="text-xs font-medium text-ink-muted">Itens</div>
                <Shimmer className="mt-1" width="2rem" height="1.25rem" />
            </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4.5">
            <div className="flex flex-col items-end gap-1.5">
                <Shimmer width="11rem" height="2.5rem" />
                <Shimmer width="7rem" height="0.875rem" />
            </div>
            <Button disabled className="px-7 py-4.5 text-base">
                Concluir empacotamento
            </Button>
        </div>
    </footer>
);
