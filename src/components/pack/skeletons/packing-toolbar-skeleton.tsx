import { Shimmer } from "@/components/ui/shimmer";
import { Button } from "@/components/ui/button";

export const PackingToolbarSkeleton = () => (
    <div className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-70 flex-1 items-center gap-3 scan-box py-1.75 pr-1.75 pl-4">
            <Shimmer className="flex-1" width="100%" height="1.25rem" />
            <Shimmer width="4.5rem" height="2.75rem" />
        </div>
        <Button variant="ghost" disabled className="self-stretch px-5 py-3.5 text-sm">
            + Item avulso
        </Button>
    </div>
);
