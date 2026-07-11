import type { HistoryRow } from "@/lib/schemas";
import { formatPercent } from "@/utils/format";
import { spansMultipleDays, formatOrderedAt } from "@/utils/date";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";

interface HistoryTableProps {
    rows: HistoryRow[];
}

const MAX_ROWS = 30;
const GRID_COLS = "grid-cols-[1fr_1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_1.1fr]";

export const HistoryTable = ({ rows }: HistoryTableProps) => {
    const multiDay = spansMultipleDays(rows.map((row) => row.orderedAt));
    const visible = rows.slice(0, MAX_ROWS);
    const remaining = Math.max(0, rows.length - MAX_ROWS);
    const trailing =
        remaining > 0 ? (
            <div className="border-t border-border px-4.5 py-3 text-center text-xs text-ink-muted">
                + {remaining} pedidos no período
            </div>
        ) : undefined;
    return (
        <>
            <DataTable trailing={trailing}>
                <DataTableHeader gridCols={GRID_COLS}>
                    <span>Data</span>
                    <span>Cliente</span>
                    <span className="text-right">Custo</span>
                    <span className="text-right">Custo fixo</span>
                    <span className="text-right">CPA</span>
                    <span className="text-right">Impostos</span>
                    <span className="text-right">Venda</span>
                    <span className="text-right">Margem líquida</span>
                </DataTableHeader>
                {visible.map((row) => {
                    const negativeMargin = (row.netMarginCents ?? 0) < 0;
                    return (
                        <DataTableRow key={row.orderId} gridCols={GRID_COLS}>
                            <span className="font-mono text-xs text-ink-muted tabular-nums">
                                {formatOrderedAt(row.orderedAt, multiDay)}
                            </span>
                            <span className="text-sm font-semibold text-ink">{row.recipientName ?? "—"}</span>
                            <span className="text-right font-mono text-sm text-ink-muted tabular-nums">
                                {row.itemsCostBrl ?? "—"}
                            </span>
                            <span className="text-right font-mono text-sm text-ink-muted tabular-nums">
                                {row.fixedCostBrl}
                            </span>
                            <span className="text-right font-mono text-sm text-ink-muted tabular-nums">
                                {row.cpaBrl}
                            </span>
                            <span className="text-right font-mono text-sm text-ink-muted tabular-nums">
                                {row.taxBrl}
                            </span>
                            <span className="text-right font-mono text-sm text-ink tabular-nums">{row.saleBrl}</span>
                            <span className="text-right">
                                <span className="inline-flex items-center justify-end gap-1.75">
                                    <span
                                        className={`font-mono text-sm font-semibold tabular-nums ${
                                            negativeMargin ? "text-negative" : "text-positive"
                                        }`}
                                    >
                                        {row.netMarginBrl ?? "—"}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ${
                                            negativeMargin
                                                ? "bg-negative-soft text-negative"
                                                : "bg-positive-soft text-positive"
                                        }`}
                                    >
                                        {row.netMarginPct != null ? formatPercent(row.netMarginPct) : "—"}
                                    </span>
                                </span>
                            </span>
                        </DataTableRow>
                    );
                })}
            </DataTable>
            <p className="m-0 text-xs text-ink-muted">
                * Margem líquida já com CPA, impostos e custo fixo descontados.
            </p>
        </>
    );
};
