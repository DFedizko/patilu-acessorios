import type { ReactNode } from "react";

interface DataTableRowProps {
    gridCols: string;
    children: ReactNode;
}

export const DataTableRow = ({ gridCols, children }: DataTableRowProps) => (
    <div
        className={`grid ${gridCols} items-center gap-3 border-t border-border px-4.5 py-3 transition-colors duration-150 hover:bg-hover`}
    >
        {children}
    </div>
);
