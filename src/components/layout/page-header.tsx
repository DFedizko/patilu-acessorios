import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-6 print:hidden">
        <h1 className="truncate text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="hidden min-w-0 truncate text-sm text-ink-muted lg:block">{subtitle}</p>}
        {children && <div className="ml-auto flex shrink-0 items-center gap-2">{children}</div>}
    </header>
);
