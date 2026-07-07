import type { DashboardData } from "@/lib/schemas";
import { formatPercent } from "@/utils/format";
import { LineChart } from "@/components/ui/chart/line-chart";

interface MarginChartPanelProps {
    marginSeries: DashboardData["marginSeries"];
}

export const MarginChartPanel = ({ marginSeries }: MarginChartPanelProps) => {
    const points = marginSeries.map((item) => ({ label: item.label, value: item.marginPct }));
    return (
        <div className="flex flex-col gap-3.5 panel p-5">
            <div className="text-sm font-semibold text-ink">Margem ao longo do tempo</div>
            <div className="h-52.5 w-full">
                <LineChart points={points} seriesName="Margem" formatValue={formatPercent} />
            </div>
            <div className="flex justify-between">
                {points.map((point, index) => (
                    <span key={index} className="text-xs text-ink-muted tabular-nums">
                        {point.label}
                    </span>
                ))}
            </div>
        </div>
    );
};
