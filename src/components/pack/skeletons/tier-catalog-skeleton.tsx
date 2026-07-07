import { Shimmer } from "@/components/ui/shimmer";

const SECTION_COUNT = 2;
const CARDS_PER_SECTION = 4;

export const TierCatalogSkeleton = () => (
    <>
        {Array.from({ length: SECTION_COUNT }, (_, sectionIndex) => (
            <section key={sectionIndex} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Shimmer width="6rem" height="1.125rem" />
                    <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(12.375rem,1fr))] gap-3">
                    {Array.from({ length: CARDS_PER_SECTION }, (_, cardIndex) => (
                        <div key={cardIndex} className="flex flex-col gap-3.25 card-base p-3.75">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-1.5">
                                    <Shimmer width="6rem" height="1rem" />
                                    <Shimmer width="8rem" height="0.75rem" />
                                </div>
                                <Shimmer width="1.25rem" height="1.5rem" />
                            </div>
                            <div className="flex items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                    <Shimmer width="2.875rem" height="2.875rem" rounded="lg" />
                                    <Shimmer width="2.875rem" height="2.875rem" rounded="lg" />
                                </div>
                                <Shimmer width="3.5rem" height="0.875rem" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        ))}
    </>
);
