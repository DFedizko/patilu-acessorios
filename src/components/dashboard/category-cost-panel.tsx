import type { DashboardData } from "@/lib/schemas";
import { formatCurrency } from "@/utils/format";

interface CategoryCostPanelProps {
    costByCategory: DashboardData["costByCategory"];
}

const BAR_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

export const CategoryCostPanel = ({ costByCategory }: CategoryCostPanelProps) => {
    const maxCost = Math.max(...costByCategory.map((c) => c.costCents), 1);
    return (
        <div className="flex flex-col gap-4 panel p-5">
            <div className="text-[0.9375rem] font-bold text-ink">Custo por categoria</div>
            <div className="flex flex-col gap-3.5">
                {costByCategory.map((item, index) => (
                    <div key={item.categoryName} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[0.8125rem]">
                            <span className="font-semibold text-ink">{item.categoryName}</span>
                            <span className="text-muted tabular-nums">{formatCurrency(item.costCents / 100)}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-line">
                            <div
                                className={`h-full rounded-full ${BAR_COLORS[index % BAR_COLORS.length]}`}
                                style={{ width: `${Math.round((item.costCents / maxCost) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
