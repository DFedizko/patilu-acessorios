import type { ReactNode } from "react";

interface DataTableHeaderProps {
    gridCols: string;
    children: ReactNode;
}

export const DataTableHeader = ({ gridCols, children }: DataTableHeaderProps) => (
    <div className={`grid ${gridCols} items-center gap-6 bg-surface-2 px-4.5 py-3 text-xs font-medium text-ink-muted`}>
        {children}
    </div>
);
