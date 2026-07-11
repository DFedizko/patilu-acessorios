import { Shimmer } from "@/components/ui/shimmer";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";

const GRID_COLS = "grid-cols-[1fr_1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_1.1fr]";
const TABLE_ROWS = 8;

export const HistoryTableSkeleton = () => (
    <>
        <DataTable>
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
            {Array.from({ length: TABLE_ROWS }, (_, index) => (
                <DataTableRow key={index} gridCols={GRID_COLS}>
                    <Shimmer width="4rem" height="0.875rem" />
                    <Shimmer width="8rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="3.5rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="3.5rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="3.5rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="3.5rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="4rem" height="0.875rem" />
                    <Shimmer className="ml-auto" width="6.5rem" height="1.25rem" rounded="full" />
                </DataTableRow>
            ))}
        </DataTable>
        <p className="m-0 text-xs text-ink-muted">* Margem líquida já com CPA, impostos e custo fixo descontados.</p>
    </>
);
