"use client";

import type { Period } from "@/utils/types";
import { formatCurrency } from "@/utils/format";
import { frontContainer } from "@/di/container";
import { Button } from "@/components/ui/button";
import { useAdSpend } from "@/hooks/query/use-ad-spend";
import { ManualAdSpendForm } from "@/components/ad-spend/manual-ad-spend-form";

interface AdsInvestmentPanelProps {
    period: Period;
    from?: string;
    to?: string;
    totalAdsCents: number;
    orderCount: number;
}

export const AdsInvestmentPanel = ({ period, from, to, totalAdsCents, orderCount }: AdsInvestmentPanelProps) => {
    const reportService = frontContainer.getReportService();
    const { data: adSpend } = useAdSpend({ period, from, to });
    const adsPerOrder = orderCount > 0 ? totalAdsCents / orderCount : 0;
    const handleExport = () => {
        window.location.href = reportService.exportHistoryUrl({ period, from, to });
    };
    return (
        <div className="flex flex-col gap-3">
            {adSpend && !adSpend.available && <ManualAdSpendForm from={from} />}
            <div className="flex flex-wrap items-end gap-4.5 panel-sm px-4.5 py-4">
                <div className="flex flex-col gap-0.75">
                    <span className="text-xs font-semibold text-muted">Total de ads no período</span>
                    <span className="font-head text-2xl font-bold text-ads tabular-nums">
                        {formatCurrency(totalAdsCents / 100)}
                    </span>
                </div>
                <div className="flex flex-col gap-0.75">
                    <span className="text-xs font-semibold text-muted">CPA médio por pedido</span>
                    <span className="font-head text-2xl font-bold text-accent tabular-nums">
                        {formatCurrency(adsPerOrder / 100)}
                    </span>
                </div>
                <div className="flex-1" />
                <Button onClick={handleExport} className="px-5 py-3.25 text-sm">
                    ↓ Exportar para Excel
                </Button>
            </div>
        </div>
    );
};
