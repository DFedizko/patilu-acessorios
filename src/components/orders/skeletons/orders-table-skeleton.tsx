import { Shimmer } from "@/components/ui/shimmer";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableHeader } from "@/components/ui/data-table/data-table-header";
import { DataTableRow } from "@/components/ui/data-table/data-table-row";

const GRID_COLS = "grid-cols-[1.5fr_1fr_1fr_0.7fr_1fr_1.2fr]";
const TABLE_ROWS = 7;

export const OrdersTableSkeleton = () => (
    <DataTable>
        <DataTableHeader gridCols={GRID_COLS}>
            <span>Cliente</span>
            <span className="text-right">Valor</span>
            <span className="text-right">Frete</span>
            <span>Hora</span>
            <span>Status</span>
            <span>Ação</span>
        </DataTableHeader>
        {Array.from({ length: TABLE_ROWS }, (_, index) => (
            <DataTableRow key={index} gridCols={GRID_COLS}>
                <Shimmer width="9rem" height="0.875rem" />
                <Shimmer className="ml-auto" width="4rem" height="0.875rem" />
                <Shimmer className="ml-auto" width="3.5rem" height="0.875rem" />
                <Shimmer width="2.5rem" height="0.875rem" />
                <Shimmer width="5.5rem" height="1.25rem" rounded="full" />
                <Shimmer width="6.5rem" height="1.75rem" rounded="md" />
            </DataTableRow>
        ))}
    </DataTable>
);
