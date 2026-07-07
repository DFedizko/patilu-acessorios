import type { ReactNode } from "react";

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
    <section className="flex flex-col items-center gap-3 panel px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            {icon}
        </span>
        <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            <p className="mx-auto max-w-80 text-sm text-ink-muted">{description}</p>
        </div>
        {action}
    </section>
);
