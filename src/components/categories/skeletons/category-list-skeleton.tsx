import { Shimmer } from "@/components/ui/shimmer";

const CATEGORY_COUNT = 2;
const TIERS_PER_CATEGORY = 2;

export const CategoryListSkeleton = () => (
    <>
        {Array.from({ length: CATEGORY_COUNT }, (_, categoryIndex) => (
            <section key={categoryIndex} className="overflow-hidden panel">
                <div className="flex items-center gap-2.5 bg-surface-2 px-4.5 py-3.5">
                    <Shimmer width="8rem" height="1.125rem" />
                    <span className="flex-1" />
                    <Shimmer width="6rem" height="2rem" />
                    <Shimmer width="4.5rem" height="2rem" />
                </div>
                {Array.from({ length: TIERS_PER_CATEGORY }, (_, tierIndex) => (
                    <div key={tierIndex} className="flex items-center gap-3 border-t border-border px-4.5 py-3">
                        <Shimmer className="flex-1" width="10rem" height="0.875rem" />
                        <Shimmer width="4rem" height="0.875rem" />
                        <Shimmer width="5rem" height="0.75rem" />
                        <Shimmer width="4.5rem" height="2rem" />
                        <Shimmer width="4rem" height="2rem" />
                        <Shimmer width="1.5rem" height="1.5rem" rounded="full" />
                    </div>
                ))}
                <div className="flex items-end gap-2.5 border-t border-border bg-surface-2 px-4.5 py-3.25">
                    <Shimmer className="flex-1" width="100%" height="2.5rem" />
                    <Shimmer width="7.5rem" height="2.5rem" />
                    <Shimmer width="5rem" height="2.5rem" />
                </div>
            </section>
        ))}
    </>
);
