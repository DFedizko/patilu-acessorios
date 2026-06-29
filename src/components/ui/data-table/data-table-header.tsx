import type { ReactNode } from "react";

interface DataTableHeaderProps {
    gridCols: string;
    children: ReactNode;
}

export const DataTableHeader = ({ gridCols, children }: DataTableHeaderProps) => (
    <div
        className={`grid ${gridCols} gap-3 bg-tint px-4.5 py-3.25 text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase`}
    >
        {children}
    </div>
);
