import { Shimmer } from "@/components/ui/shimmer";

const BAR_COUNT = 3;

export const CategoryCostPanelSkeleton = () => (
    <section className="flex flex-col gap-4 panel p-5">
        <div className="text-sm font-semibold text-ink">Custo por categoria</div>
        <div className="flex flex-col gap-3.5">
            {Array.from({ length: BAR_COUNT }, (_, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                    <div className="flex justify-between">
                        <Shimmer width="6rem" height="0.875rem" />
                        <Shimmer width="4rem" height="0.875rem" />
                    </div>
                    <Shimmer width="100%" height="0.625rem" rounded="full" />
                </div>
            ))}
        </div>
    </section>
);
