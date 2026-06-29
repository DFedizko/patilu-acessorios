import type { ReactNode } from "react";

interface FieldProps {
    label: string;
    children: ReactNode;
    className?: string;
}

export const Field = ({ label, children, className = "" }: FieldProps) => (
    <label className={`flex flex-col gap-1.5 ${className}`}>
        <span className="text-xs font-semibold text-muted">{label}</span>
        {children}
    </label>
);
