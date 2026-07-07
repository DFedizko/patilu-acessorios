import { Shimmer } from "@/components/ui/shimmer";

const AXIS_LABEL_COUNT = 6;

export const MarginChartPanelSkeleton = () => (
    <section className="flex flex-col gap-3.5 panel p-5">
        <div className="text-sm font-semibold text-ink">Margem ao longo do tempo</div>
        <Shimmer width="100%" height="13.125rem" rounded="lg" />
        <div className="flex justify-between">
            {Array.from({ length: AXIS_LABEL_COUNT }, (_, index) => (
                <Shimmer key={index} width="2rem" height="0.75rem" />
            ))}
        </div>
    </section>
);
