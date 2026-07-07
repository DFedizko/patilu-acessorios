import { Shimmer } from "@/components/ui/shimmer";

const TAB_WIDTHS = ["3.5rem", "4.5rem", "3.5rem", "6.5rem"];

export const PeriodTabsSkeleton = () => (
    <div className="flex flex-wrap gap-2">
        {TAB_WIDTHS.map((width, index) => (
            <Shimmer key={index} width={width} height="2.25rem" rounded="full" />
        ))}
    </div>
);
