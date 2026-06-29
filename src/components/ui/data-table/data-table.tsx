import type { ReactNode } from "react";

interface DataTableProps {
    trailing?: ReactNode;
    children: ReactNode;
}

export const DataTable = ({ trailing, children }: DataTableProps) => (
    <div className="overflow-hidden panel">
        {children}
        {trailing}
    </div>
);
