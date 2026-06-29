import type { HistoryRow } from "@/lib/schemas";
import { formatCurrency, formatPercent } from "@/utils/format";
import { formatShortDay } from "@/utils/date";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";

interface HistoryTableProps {
    rows: HistoryRow[];
}

const MAX_ROWS = 30;
const GRID_COLS = "grid-cols-[0.6fr_0.7fr_1.3fr_0.8fr_0.8fr_0.8fr_1.1fr]";

const formatOrderedAt = (orderedAt: string): { date: string; time: string } => {
    const [datePart, timePart] = orderedAt.split("T");
    return { date: formatShortDay(datePart ?? ""), time: timePart?.substring(0, 5) ?? "" };
};

export const HistoryTable = ({ rows }: HistoryTableProps) => {
    const visible = rows.slice(0, MAX_ROWS);
    const remaining = Math.max(0, rows.length - MAX_ROWS);
    const trailing =
        remaining > 0 ? (
            <div className="border-t border-line px-4.5 py-3 text-center text-[0.8125rem] text-muted">
                + {remaining} pedidos no período
            </div>
        ) : undefined;
    return (
        <>
            <DataTable trailing={trailing}>
                <DataTableHeader gridCols={GRID_COLS}>
                    <span>Data</span>
                    <span>Hora</span>
                    <span>Cliente</span>
                    <span className="text-right">CPA</span>
                    <span className="text-right">Custo fixo</span>
                    <span className="text-right">Venda</span>
                    <span className="text-right">Margem líquida</span>
                </DataTableHeader>
                {visible.map((row) => {
                    const { date, time } = formatOrderedAt(row.orderedAt);
                    return (
                        <DataTableRow key={row.orderId} gridCols={GRID_COLS}>
                            <span className="text-[0.8125rem] text-muted tabular-nums">{date}</span>
                            <span className="text-[0.8125rem] text-muted tabular-nums">{time}</span>
                            <span className="text-sm font-semibold text-ink">{row.recipientName ?? "—"}</span>
                            <span className="text-right text-sm text-muted tabular-nums">
                                {formatCurrency(row.cpaCents / 100)}
                            </span>
                            <span className="text-right text-sm text-muted tabular-nums">
                                {formatCurrency(row.fixedCostCents / 100)}
                            </span>
                            <span className="text-right text-sm text-ink tabular-nums">
                                {formatCurrency(row.saleCents / 100)}
                            </span>
                            <span className="text-right">
                                <span className="inline-flex items-center justify-end gap-1.75">
                                    <span className="text-sm font-bold text-primary tabular-nums">
                                        {row.netMarginCents != null ? formatCurrency(row.netMarginCents / 100) : "—"}
                                    </span>
                                    <span className="rounded-full bg-ghost px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
                                        {row.netMarginPct != null ? formatPercent(row.netMarginPct) : "—"}
                                    </span>
                                </span>
                            </span>
                        </DataTableRow>
                    );
                })}
            </DataTable>
            <p className="m-0 text-xs text-muted">* Margem líquida já com CPA e custo fixo descontados.</p>
        </>
    );
};
